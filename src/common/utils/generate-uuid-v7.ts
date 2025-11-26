/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { randomBytes } from 'node:crypto';

/**
 * Internal state for maintaining monotonicity across UUID generations
 * timestamp - Last used timestamp in milliseconds since Unix epoch.
 * sequence -  Sequence number for the timestamp.
 */
interface UuidV7State {
  timestamp: number;
  sequence: number;
}

/**
 * Global state for maintaining monotonicity across UUID generations
 */
const _state: UuidV7State = {
  timestamp: -Infinity,
  sequence: 0,
};

/**
 * Generates a UUID v7 string.
 * Maintains monotonic ordering across calls through shared global state.
 * 122 bits of entropy and RFC 9562 compliant.
 *
 * @returns UUID v7 string in standard format (8-4-4-4-12)
 *
 * @example
 * ```typescript
 * // Simple generation
 * const uuid = generateUuidV7();
 * console.log(uuid); // "01999640-8cb3-7275-aae3-2ef23b5eb01b"
 *
 */
function generateUuidV7(): string {
  const now = Date.now();
  const generatedRandomBytes = new Uint8Array(randomBytes(16));

  updateV7State(now, generatedRandomBytes);
  const bytes = v7Bytes(generatedRandomBytes, _state.timestamp, _state.sequence);

  return bytesToUuid(bytes);
}

/**
 * Updates global state to maintain monotonic ordering between UUID generations.
 * Handles time progression, 32-bit rollover, timestamp bumping and sequence initialization/incrementing/reset.
 * Handles entropy specified in RFC 9562.
 */
function updateV7State(currentTimestamp: number, randomByteArray: Uint8Array): void {
  if (currentTimestamp > _state.timestamp) {
    _state.sequence =
      (randomByteArray[6]! << 23) | (randomByteArray[7]! << 16) | (randomByteArray[8]! << 8) | randomByteArray[9]!;
    _state.timestamp = currentTimestamp;
  } else {
    _state.sequence = (_state.sequence + 1) | 0;

    if (_state.sequence === 0) {
      _state.timestamp++;
    }
  }
}

/**
 * Constructs UUID v7 bytes from timestamp, sequence, and random components.
 * Writes the 48-bit timestamp to the first 6 bytes of the UUID.
 * Stores milliseconds since Unix epoch in big-endian format.
 *
 * Writes version identifier and sequence bits to bytes 6-10 of the UUID.
 * Encodes version 7 identifier (0x7), variant bits (0x8), and sequence data.
 *
 * Layout:
 * - Byte 6: Version (4 bits) + Sequence[31:28] (4 bits)
 * - Byte 7: Sequence[27:20] (8 bits)
 * - Byte 8: Variant (2 bits) + Sequence[19:14] (6 bits)
 * - Byte 9: Sequence[13:6] (8 bits)
 * - Byte 10: Sequence[5:0] (6 bits) + Random (2 bits)
 *
 * Writes random bytes to the final 5 bytes (11-15) of the UUID.
 * Provides additional entropy as specified in RFC 9562.
 *
 * @param randomBytes - 16-byte array of random values
 * @param timestamp - Current timestamp in milliseconds since Unix epoch
 * @param sequence - 32-bit sequence number for the current timestamp
 * @returns 16-byte array representing the UUID v7
 */
function v7Bytes(randomBytes: Uint8Array, timestamp: number, sequence: number): Uint8Array {
  if (randomBytes.length < 16) {
    throw new Error('Random bytes length must be >= 16');
  }

  const buffer = new Uint8Array(16);
  let offset = 0;

  // Timestamp (48 bits)
  buffer[offset++] = (timestamp / 0x10000000000) & 0xff;
  buffer[offset++] = (timestamp / 0x100000000) & 0xff;
  buffer[offset++] = (timestamp / 0x1000000) & 0xff;
  buffer[offset++] = (timestamp / 0x10000) & 0xff;
  buffer[offset++] = (timestamp / 0x100) & 0xff;
  buffer[offset++] = timestamp & 0xff;

  // Write version and sequence bits
  buffer[offset++] = 0x70 | ((sequence >>> 28) & 0x0f);
  buffer[offset++] = (sequence >>> 20) & 0xff;
  buffer[offset++] = 0x80 | ((sequence >>> 14) & 0x3f);
  buffer[offset++] = (sequence >>> 6) & 0xff;
  buffer[offset++] = ((sequence << 2) & 0xff) | (randomBytes[10]! & 0x03);

  // Random bytes - bytes 11-15
  buffer[offset++] = randomBytes[11]!;
  buffer[offset++] = randomBytes[12]!;
  buffer[offset++] = randomBytes[13]!;
  buffer[offset++] = randomBytes[14]!;
  buffer[offset++] = randomBytes[15]!;

  return buffer;
}

const byteToHex: string[] = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

/**
 * Converts 16-byte array to standard UUID string format (8-4-4-4-12).
 * Uses precomputed hex lookup table for efficiency.
 *
 * @param bytes - 16-byte array representing the UUID
 * @returns UUID string in standard format (8-4-4-4-12)
 */
function bytesToUuid(bytes: Uint8Array): string {
  return (
    byteToHex[bytes[0]!]! +
    byteToHex[bytes[1]!] +
    byteToHex[bytes[2]!] +
    byteToHex[bytes[3]!] +
    '-' +
    byteToHex[bytes[4]!] +
    byteToHex[bytes[5]!] +
    '-' +
    byteToHex[bytes[6]!] +
    byteToHex[bytes[7]!] +
    '-' +
    byteToHex[bytes[8]!] +
    byteToHex[bytes[9]!] +
    '-' +
    byteToHex[bytes[10]!] +
    byteToHex[bytes[11]!] +
    byteToHex[bytes[12]!] +
    byteToHex[bytes[13]!] +
    byteToHex[bytes[14]!] +
    byteToHex[bytes[15]!]
  ).toLowerCase();
}

/**
 * Validates whether a string is a properly formatted UUID v7.
 * Checks format, version bits, and variant bits according to RFC 9562.
 * Basic format: 8-4-4-4-12 hexadecimal pattern.
 *
 * @param uuid - String to validate as UUID v7
 * @returns True if the string is a valid UUID v7, false otherwise
 *
 * @example
 * ```typescript
 * const uuid = generateUuidV7();
 * console.log(isValidUuidV7(uuid)); // true
 *
 * console.log(isValidUuidV7("018c4f3e-7b2a-4d4f-8a1b-2c3d4e5f6789")); // false (wrong version)
 * console.log(isValidUuidV7("not-a-uuid")); // false
 * ```
 */
function isValidUuidV7(uuid: string): boolean {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!UUID_REGEX.test(uuid)) {
    return false;
  }

  const cleanHex = uuid.replace(/-/g, '');
  const versionBits = parseInt(cleanHex[12]!, 16);

  if ((versionBits & 0x0f) !== 0x07) {
    return false;
  }

  const variantBits = parseInt(cleanHex[16]!, 16);

  return (variantBits & 0x0c) === 0x08;
}

/**
 * Extracts the timestamp from a UUID v7 string.
 * Parses the first 48 bits to retrieve the original millisecond timestamp.
 * Converts 12 hex characters back to millisecond timestamp value.
 *
 * @param uuid - UUID v7 string to extract timestamp from
 * @returns Date object representing the timestamp, or null if UUID is invalid
 *
 * @example
 * ```typescript
 * const uuid = generateUuidV7();
 *
 * const extractedDate = extractUuidV7Timestamp(uuid);
 * console.log(extractedDate); // Date object close to current time
 *
 * const invalidDate = extractUuidV7Timestamp("invalid-uuid");
 * console.log(invalidDate); // null
 * ```
 */
function extractUuidV7Timestamp(uuid: string): Date | null {
  if (!isValidUuidV7(uuid)) {
    return null;
  }

  const cleanHex = uuid.replace(/-/g, '');
  const timestampHex = cleanHex.slice(0, 12);

  const high = parseInt(timestampHex.slice(0, 4), 16);
  const low = parseInt(timestampHex.slice(4), 16);
  const timestamp = high * 0x100000000 + low;

  return new Date(timestamp);
}

export { generateUuidV7, isValidUuidV7, extractUuidV7Timestamp };
export default generateUuidV7;

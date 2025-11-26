import { Injectable } from '@nestjs/common';
import { argon2id, hash, Options, verify } from 'argon2';

@Injectable()
export class Argon2HashingService {
  private readonly options: Options = {
    hashLength: 32,
    type: argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };

  constructor() {}

  /**
   * Hashes a given plain text string using Argon2.
   * @param plainText The string to hash.
   * @returns A promise that resolves to the hashed string.
   */
  public async hash(plainText: string): Promise<string> {
    return await hash(plainText, this.options);
  }

  /**
   * Compares a given plain text string against a hashed string using Argon2.
   * @param plainText The string to compare.
   * @param hashedValue The hashed string to compare against.
   * @returns A promise that resolves to a boolean indicating whether the plain text string matches the hashed string.
   */
  public async compare(plainText: string, hashedValue: string): Promise<boolean> {
    return await verify(hashedValue, plainText);
  }
}

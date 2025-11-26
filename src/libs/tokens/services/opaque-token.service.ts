import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { NUMBER_OF_MILLISECONDS_IN_SECOND } from 'src/common/constants';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { EOpaqueTokenType } from 'src/libs/tokens/common/enums';
import { IOpaqueTokenData, IOpaqueTokenMetadata } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class OpaqueTokenService implements OnModuleInit {
  private REFRESH_TTL: number;
  private REGISTRATION_TOKEN_TTL: number;
  private OTP_VERIFICATION_TOKEN_TTL: number;
  private refreshSecret: CryptoKey;
  private registrationSecret: CryptoKey;
  private otpVerificationSecret: CryptoKey;
  private readonly TOKEN_VERSION: string = 'v1';
  private readonly RANDOM_BYTES = 16;
  private readonly HMAC_CHARS: number = 16;

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    const {
      OPAQUE_REFRESH_TOKEN_SECRET,
      OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME,
      OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME,
      OPAQUE_REGISTRATION_TOKEN_SECRET,
      OPAQUE_OTP_VERIFICATION_TOKEN_SECRET,
      OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME,
    } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

    this.refreshSecret = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(OPAQUE_REFRESH_TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
    this.REFRESH_TTL = OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME;

    this.registrationSecret = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(OPAQUE_REGISTRATION_TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
    this.REGISTRATION_TOKEN_TTL = OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME;

    this.otpVerificationSecret = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(OPAQUE_OTP_VERIFICATION_TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    );
    this.OTP_VERIFICATION_TOKEN_TTL = OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME;
  }

  public async generateRefreshToken(): Promise<string> {
    return await this.generateToken(EOpaqueTokenType.REFRESH, this.refreshSecret, this.REFRESH_TTL);
  }

  public getExpirationTimeRefreshToken(): Date {
    return new Date(Date.now() + this.REFRESH_TTL * NUMBER_OF_MILLISECONDS_IN_SECOND);
  }

  public async verifyRefreshToken(token: string): Promise<IOpaqueTokenData | null> {
    return await this.verifyToken(token, EOpaqueTokenType.REFRESH, this.refreshSecret);
  }

  public async generateRegistrationToken(): Promise<string> {
    return await this.generateToken(
      EOpaqueTokenType.REGISTRATION,
      this.registrationSecret,
      this.REGISTRATION_TOKEN_TTL,
    );
  }

  public async verifyRegistrationToken(token: string): Promise<IOpaqueTokenData | null> {
    return await this.verifyToken(token, EOpaqueTokenType.REGISTRATION, this.registrationSecret);
  }

  public async generateOtpVerificationToken(): Promise<string> {
    return await this.generateToken(
      EOpaqueTokenType.OTP_VERIFICATION,
      this.otpVerificationSecret,
      this.OTP_VERIFICATION_TOKEN_TTL,
    );
  }

  public async verifyOtpVerificationToken(token: string): Promise<IOpaqueTokenData | null> {
    return await this.verifyToken(token, EOpaqueTokenType.OTP_VERIFICATION, this.otpVerificationSecret);
  }

  /**
   * Generates an opaque token with the given type, secret and expiration time.
   * @returns A promise resolving to the generated opaque token.
   * @remarks
   * The opaque token is generated using the following components:
   * - A random component of 16 bytes
   * - The type of the token (reg/rol/otp/acc/ref)
   * - The version of the token (v1)
   * - The expiration time of the token in seconds
   * - The HMAC of the token prefix using the provided secret
   */
  private async generateToken(type: EOpaqueTokenType, secret: CryptoKey, ttl: number): Promise<string> {
    const random = crypto.getRandomValues(new Uint8Array(this.RANDOM_BYTES));
    const randomStr = Buffer.from(random).toString('base64url');

    const expiration = Math.floor(Date.now() / NUMBER_OF_MILLISECONDS_IN_SECOND) + ttl;
    const tokenPrefix = `${type}.${this.TOKEN_VERSION}.${randomStr}.${expiration}`;

    const signature = await crypto.subtle.sign('HMAC', secret, new TextEncoder().encode(tokenPrefix));
    const hmac = Buffer.from(signature).toString('base64url').slice(0, this.HMAC_CHARS);

    return `${tokenPrefix}.${hmac}`;
  }

  /**
   * Verify an opaque token.
   * @param token - The opaque token to verify
   * @param expectedType - The expected type of the token (reg/rol/acc/ref)
   * @param secret - The secret key used to generate the HMAC
   * @returns The parsed token metadata, or null if invalid
   */
  public async verifyToken(
    token: string,
    expectedType: EOpaqueTokenType,
    secret: CryptoKey,
  ): Promise<IOpaqueTokenData | null> {
    const metadata = this.parse(token);

    if (!metadata) {
      return null;
    }

    if (!this.validateTokenSemantics(metadata, expectedType)) {
      return null;
    }

    if (!(await this.verifySignature(metadata, secret))) {
      return null;
    }

    return { ...metadata, token };
  }

  /**
   * Parses an opaque token and returns the metadata if valid.
   * Returns null if the token is invalid.
   * @param token - The opaque token to parse
   * @returns The parsed metadata, or null if invalid
   */
  private parse(token: string): IOpaqueTokenMetadata | null {
    const TOKEN_PARTS: number = 5;
    const parts = token.split('.');

    if (parts.length !== TOKEN_PARTS) {
      return null;
    }

    const [type, version, random, exp, hmac] = parts;

    if (!type || !version || !random || !exp || !hmac) {
      return null;
    }

    const expNumber = Number(exp);

    if (!Number.isFinite(expNumber)) {
      return null;
    }

    return {
      type: type as EOpaqueTokenType,
      version,
      random,
      hmac,
      exp: expNumber,
    };
  }

  /**
   * Validates the semantic properties of an opaque token
   * @param metadata - Token metadata to validate
   * @param expectedType - Expected type of the token
   * @returns true if the token is valid, false otherwise
   * @remarks
   * Checks that the type is a valid enum value, matches the expected type, matches the expected version and
   * has not expired.
   */
  private validateTokenSemantics(metadata: IOpaqueTokenMetadata, expectedType: EOpaqueTokenType): boolean {
    if (metadata.type !== expectedType) {
      return false;
    }

    if (!metadata.version.startsWith('v')) {
      return false;
    }

    const now = Math.floor(Date.now() / NUMBER_OF_MILLISECONDS_IN_SECOND);

    if (now > metadata.exp) {
      return false;
    }

    return true;
  }

  /**
   * Verifies the signature of an opaque token using the provided secret.
   * @param metadata - Token metadata containing the HMAC to verify
   * @param secret - Secret key used to generate the HMAC
   * @returns true if the HMAC is valid, false otherwise
   * @remarks
   * Uses constant-time comparison to prevent timing attacks.
   */
  private async verifySignature(metadata: IOpaqueTokenMetadata, secret: CryptoKey): Promise<boolean> {
    const tokenPrefix = `${metadata.type}.${metadata.version}.${metadata.random}.${metadata.exp}`;
    const signature = await crypto.subtle.sign('HMAC', secret, new TextEncoder().encode(tokenPrefix));
    const expectedHmac = Buffer.from(signature).toString('base64url').slice(0, this.HMAC_CHARS);

    return crypto.timingSafeEqual(Buffer.from(expectedHmac), Buffer.from(metadata.hmac));
  }
}

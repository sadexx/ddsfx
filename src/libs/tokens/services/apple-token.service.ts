import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult } from 'jose';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { LokiLogger } from 'src/libs/logger';
import { IAppleJWTPayload, IAppleProviderOutput } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class AppleTokenService {
  private readonly lokiLogger = new LokiLogger(AppleTokenService.name);
  private readonly APPLE_ISSUER = 'https://appleid.apple.com';
  private readonly APPLE_PATH_KEYS = 'auth/keys';
  private readonly APPLE_AUDIENCE: string;
  private readonly JWKS: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly configService: ConfigService) {
    const { APPLE_CLIENT_ID } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.APPLE_AUDIENCE = APPLE_CLIENT_ID;

    this.JWKS = createRemoteJWKSet(new URL(`${this.APPLE_ISSUER}/${this.APPLE_PATH_KEYS}`));
  }

  public async verifyToken(idToken: string): Promise<IAppleProviderOutput> {
    const verifiedToken = await this.verifyTokenWithJose(idToken);

    return this.transformApplePayload(verifiedToken.payload);
  }

  /**
   * Verifies an Apple identity token using the Jose library and the Apple-provided JWKS.
   *
   * This method verifies the token's signature, checks the token's issuer and audience, and verifies that the token has not expired or is not used before its valid time.
   *
   * If the token is invalid, an UnauthorizedException is thrown.
   *
   * @param idToken The Apple identity token to verify.
   * @returns A Promise resolving to the verified token payload.
   * @throws UnauthorizedException If the token is invalid.
   */
  private async verifyTokenWithJose(idToken: string): Promise<JWTVerifyResult<IAppleJWTPayload>> {
    try {
      return await jwtVerify<IAppleJWTPayload>(idToken, this.JWKS, {
        clockTolerance: '5s',
        issuer: this.APPLE_ISSUER,
        audience: this.APPLE_AUDIENCE,
        maxTokenAge: '5m',
      });
    } catch (error) {
      this.lokiLogger.error(`Failed to verify token: ${(error as Error).message}`);
      throw new UnauthorizedException('Token verification with Apple failed');
    }
  }

  /**
   * Transforms Apple's JWT payload into a standard Apple provider output object.
   *
   * @param payload - Apple's JWT payload
   * @returns - Standard Apple provider output object
   */
  private transformApplePayload(payload: IAppleJWTPayload): IAppleProviderOutput {
    return {
      email: payload.email,
      isVerifiedEmail: payload.email_verified === true || payload.email_verified === 'true',
      isPrivateEmail: payload.is_private_email ?? false,
      realUserStatus: payload.real_user_status ?? undefined,
    };
  }
}

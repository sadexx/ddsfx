import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTVerifyResult } from 'jose';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { LokiLogger } from 'src/libs/logger';
import { IGoogleJWTPayload, IGoogleProviderOutput } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class GoogleTokenService {
  private readonly lokiLogger = new LokiLogger(GoogleTokenService.name);
  private readonly GOOGLE_ISSUER_1 = 'https://accounts.google.com';
  private readonly GOOGLE_ISSUER_2 = 'accounts.google.com';
  private readonly GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
  private readonly GOOGLE_CLIENT_ID: string;
  private readonly JWKS: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly configService: ConfigService) {
    const { GOOGLE_OAUTH2_CLIENT_ID } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.GOOGLE_CLIENT_ID = GOOGLE_OAUTH2_CLIENT_ID;

    this.JWKS = createRemoteJWKSet(new URL(this.GOOGLE_JWKS_URI));
  }

  public async verifyToken(idToken: string): Promise<IGoogleProviderOutput> {
    const verifiedToken = await this.verifyTokenWithJose(idToken);

    return this.transformGooglePayload(verifiedToken.payload);
  }

  /**
   * Verifies a Google identity token using the Jose library and the Google-provided JWKS.
   *
   * This method verifies the token's signature, checks the token's issuer and audience, and verifies that the token has not expired or is not used before its valid time.
   *
   * If the token is invalid, an UnauthorizedException is thrown.
   *
   * @param idToken The Google identity token to verify.
   * @returns A Promise resolving to the verified token payload.
   * @throws UnauthorizedException If the token is invalid.
   */
  private async verifyTokenWithJose(idToken: string): Promise<JWTVerifyResult<IGoogleJWTPayload>> {
    try {
      return await jwtVerify<IGoogleJWTPayload>(idToken, this.JWKS, {
        clockTolerance: '5s',
        issuer: [this.GOOGLE_ISSUER_1, this.GOOGLE_ISSUER_2],
        audience: this.GOOGLE_CLIENT_ID,
        maxTokenAge: '5m',
      });
    } catch (error) {
      this.lokiLogger.error(`Failed to verify Google token: ${(error as Error).message}`);

      throw new UnauthorizedException('Token verification with Google failed');
    }
  }

  /**
   * Transforms Google's JWT payload into a standard Google provider output object.
   *
   * @param payload - Google's JWT payload
   * @returns - Standard Google provider output object
   */
  private transformGooglePayload(payload: IGoogleJWTPayload): IGoogleProviderOutput {
    return {
      hostedDomain: payload.hd,
      email: payload.email,
      isVerifiedEmail: payload.email_verified,
      name: payload.name,
      givenName: payload.given_name,
      familyName: payload.family_name,
      picture: payload.picture,
      locale: payload.locale,
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, SignJWT } from 'jose';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { LokiLogger } from 'src/libs/logger';
import { IJwtTokenPayload } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class JoseTokenService {
  private readonly lokiLogger = new LokiLogger(JoseTokenService.name);
  private readonly secret: Uint8Array;
  private readonly expirationTime: number;

  constructor(private readonly configService: ConfigService) {
    const { JWT_ACCESS_TOKEN_SECRET, JWT_ACCESS_TOKEN_EXPIRATION_TIME } =
      this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.secret = new TextEncoder().encode(JWT_ACCESS_TOKEN_SECRET);
    this.expirationTime = JWT_ACCESS_TOKEN_EXPIRATION_TIME;
  }

  /**
   * Signs a JWT token.
   * @param payload - The payload of the JWT token
   * @returns A promise resolving to the signed JWT token
   * @remarks
   * The JWT token is signed with the HS256 algorithm and includes the following claims:
   * - Algorithm: HS256 (alg)
   * - Type: JWT (typ)
   * - Issued at (iat) - set to the current time
   * - Expiration: Configured via JWT_ACCESS_TOKEN_EXPIRATION_TIME (seconds)
   * In production, using more secure algorithms RS256 or ES256.
   */
  public async sign(payload: IJwtTokenPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(`${this.expirationTime}s`)
      .sign(this.secret);
  }

  /**
   * Verifies a JWT token.
   * @param token - The JWT token to verify
   * @returns The payload of the JWT token if valid, otherwise throws an error
   * @throws Error - If the token is invalid
   *
   * @remarks
   * - Validates signature using HS256
   * - Checks expiration (exp claim)
   * - Allows 5-second clock skew (clockTolerance)
   */
  public async verify(token: string): Promise<IJwtTokenPayload> {
    try {
      const { payload } = await jwtVerify<IJwtTokenPayload>(token, this.secret, {
        algorithms: ['HS256'],
        typ: 'JWT',
        clockTolerance: '5s',
        maxTokenAge: `${this.expirationTime}s`,
      });

      return payload;
    } catch (error) {
      this.lokiLogger.error(`Failed to verify token: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import {
  GoogleTokenService,
  JoseTokenService,
  OpaqueTokenService,
  TokenExtractorService,
} from 'src/libs/tokens/services';
import {
  IAppleProviderOutput,
  IExtractionStrategy,
  IGoogleProviderOutput,
  IJwtTokenPayload,
  IOpaqueTokenData,
} from 'src/libs/tokens/common/interfaces';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { AppleTokenService } from './apple-token.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly joseTokenService: JoseTokenService,
    private readonly opaqueTokenService: OpaqueTokenService,
    private readonly tokenExtractorService: TokenExtractorService,
    private readonly appleTokenService: AppleTokenService,
    private readonly googleTokenService: GoogleTokenService,
  ) {}

  /**
   ** EXTRACTION STRATEGIES
   */

  public extract(request: FastifyRequest, strategies: IExtractionStrategy[]): string | null {
    return this.tokenExtractorService.extract(request, strategies);
  }

  /**
   ** APPLE TOKENS
   */

  public async verifyAppleToken(idToken: string): Promise<IAppleProviderOutput> {
    return await this.appleTokenService.verifyToken(idToken);
  }

  /**
   ** GOOGLE TOKENS
   */
  public async verifyGoogleToken(idToken: string): Promise<IGoogleProviderOutput> {
    return await this.googleTokenService.verifyToken(idToken);
  }

  /**
   ** JWT TOKENS (Access)
   */

  public generateAccessTokenPayload(userId: string, sessionId: string, roleName: EUserRoleName): IJwtTokenPayload {
    return {
      sub: userId,
      sessionId: sessionId,
      roleName: roleName,
    };
  }

  public async generateAccessToken(payload: IJwtTokenPayload): Promise<string> {
    return await this.joseTokenService.sign(payload);
  }

  public async verifyAccessToken(token: string): Promise<IJwtTokenPayload> {
    return await this.joseTokenService.verify(token);
  }

  /**
   ** OPAQUE TOKENS (Refresh, Registration, Role Selection)
   */

  public async generateRefreshToken(): Promise<string> {
    return await this.opaqueTokenService.generateRefreshToken();
  }

  public getExpirationTimeRefreshToken(): Date {
    return this.opaqueTokenService.getExpirationTimeRefreshToken();
  }

  public async verifyRefreshToken(token: string): Promise<IOpaqueTokenData | null> {
    return await this.opaqueTokenService.verifyRefreshToken(token);
  }

  public async generateRegistrationToken(): Promise<string> {
    return await this.opaqueTokenService.generateRegistrationToken();
  }

  public async verifyRegistrationToken(token: string): Promise<IOpaqueTokenData | null> {
    return await this.opaqueTokenService.verifyRegistrationToken(token);
  }

  public async generateOtpVerificationToken(): Promise<string> {
    return this.opaqueTokenService.generateOtpVerificationToken();
  }

  public async verifyOtpVerificationToken(token: string): Promise<IOpaqueTokenData | null> {
    return this.opaqueTokenService.verifyOtpVerificationToken(token);
  }
}

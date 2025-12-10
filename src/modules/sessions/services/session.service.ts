import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/libs/tokens/services';
import { IClientInfo } from 'src/common/interfaces';
import { EAuthProvider } from 'src/modules/auth/common/enums';
import { ICreateSession, IStartSessionInfo } from 'src/modules/sessions/common/interfaces';
import { Session } from 'src/modules/sessions/entities';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { OneRoleLoginOutput } from 'src/modules/auth/common/outputs';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { RefreshTokensDto } from 'src/modules/auth/common/dto';
import { LokiLogger } from 'src/libs/logger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Argon2HashingService } from 'src/libs/hashing/services';

@Injectable()
export class SessionService {
  private readonly lokiLogger = new LokiLogger(SessionService.name);
  private readonly MAX_ACTIVE_SESSIONS: number = 3;

  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    private readonly tokenService: TokenService,
    private readonly argon2HashingService: Argon2HashingService,
  ) {}

  public async startAccessSession(
    authProvider: EAuthProvider,
    user: { id: string },
    roleName: EUserRoleName,
    clientInfo: IClientInfo,
    dto: IStartSessionInfo,
  ): Promise<OneRoleLoginOutput> {
    const refreshToken = await this.tokenService.generateRefreshToken();
    const hashedRefreshToken = await this.argon2HashingService.hash(refreshToken);

    const createSession = this.constructSessionData(authProvider, roleName, clientInfo, dto, hashedRefreshToken);
    await this.checkSessionLimits(user.id);
    const session = await this.createAccessSession(createSession, user.id);

    const tokenPayload = this.tokenService.generateAccessTokenPayload(user.id, session.id, roleName);
    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      sessionId: session.id,
    };
  }

  private constructSessionData(
    authProvider: EAuthProvider,
    roleName: EUserRoleName,
    clientInfo: IClientInfo,
    dto: IStartSessionInfo,
    refreshToken: string,
  ): ICreateSession {
    return {
      roleName: roleName,
      authProvider: authProvider,
      refreshToken: refreshToken,
      refreshTokenExpirationDate: this.tokenService.getExpirationTimeRefreshToken(),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      platform: dto.deviceInfo.platform,
      pushNotificationToken: dto.deviceInfo.pushNotificationToken,
      appVersion: dto.deviceInfo.appVersion,
      osVersion: dto.deviceInfo.osVersion,
      deviceModel: dto.deviceInfo.deviceModel,
      clientIp: dto.networkMetadata.clientIp,
      country: dto.networkMetadata.country,
      city: dto.networkMetadata.city,
      region: dto.networkMetadata.region,
      postalCode: dto.networkMetadata.postalCode,
      latitude: dto.networkMetadata.latitude,
      longitude: dto.networkMetadata.longitude,
    };
  }

  private async createAccessSession(createSession: ICreateSession, userId: string): Promise<Session> {
    const session = this.sessionsRepository.create({
      ...createSession,
      user: { id: userId },
      creationDate: new Date(),
    });

    await this.sessionsRepository.save(session);

    return session;
  }

  public async updateAccessSession(
    tokenDto: IOpaqueTokenData,
    clientInfo: IClientInfo,
    dto: RefreshTokensDto,
  ): Promise<OneRoleLoginOutput> {
    const session = await this.getAccessSession(dto.sessionId);

    const isValidResult = await this.validateSession(tokenDto, clientInfo, dto, session);

    if (!isValidResult) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshToken = await this.tokenService.generateRefreshToken();
    const hashedRefreshToken = await this.argon2HashingService.hash(refreshToken);
    const refreshTokenExpirationDate = this.tokenService.getExpirationTimeRefreshToken();

    const tokenPayload = this.tokenService.generateAccessTokenPayload(session.user.id, session.id, session.roleName);
    const accessToken = await this.tokenService.generateAccessToken(tokenPayload);

    await this.updateSession({
      ...session,
      refreshToken: hashedRefreshToken,
      refreshTokenExpirationDate: refreshTokenExpirationDate,
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      sessionId: session.id,
    };
  }

  private async checkSessionLimits(userId: string): Promise<void> {
    await this.sessionsRepository
      .createQueryBuilder('session')
      .delete()
      .where(
        `id IN (
        SELECT id 
        FROM sessions 
        WHERE user_id = :userId 
        ORDER BY creation_date DESC 
        OFFSET :maxSessions
      )`,
        { userId, maxSessions: this.MAX_ACTIVE_SESSIONS - 1 },
      )
      .execute();
  }

  private async getAccessSession(sessionId: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    return session;
  }

  private async updateSession(session: Session): Promise<void> {
    await this.sessionsRepository.update(session.id, session);
  }

  public async revokeAccessSession(sessionId: string): Promise<void> {
    await this.sessionsRepository.delete(sessionId);
  }

  public async revokeAllUserSessions(userId: string): Promise<void> {
    await this.sessionsRepository.delete({ user: { id: userId } });
  }

  private async validateSession(
    tokenDto: IOpaqueTokenData,
    clientInfo: IClientInfo,
    dto: RefreshTokensDto,
    session: Session,
  ): Promise<boolean> {
    const errorContext = {
      sessionId: dto.sessionId,
    };

    const isRefreshTokenValid = await this.argon2HashingService.compare(tokenDto.token, session.refreshToken);

    if (!isRefreshTokenValid) {
      this.lokiLogger.error(`Refresh token hash mismatch attempt: ${JSON.stringify(errorContext)}`);
      this.lokiLogger.debug(`Refresh token mismatch - tokenDto: ${JSON.stringify(tokenDto)}`);
      this.lokiLogger.debug(`Refresh token mismatch - session: ${JSON.stringify(session)}`);
      const hashedRefreshTokenFromUser = await this.argon2HashingService.hash(tokenDto.token);
      this.lokiLogger.debug(`Hashed refresh token from user: ${hashedRefreshTokenFromUser}`);
      this.lokiLogger.debug(`Refresh token mismatch - session refresh token: ${session.refreshToken}`);

      return false;
    }

    if (session.refreshTokenExpirationDate < new Date()) {
      this.lokiLogger.error(`Refresh token expired attempt: ${JSON.stringify(errorContext)}`);

      return false;
    }

    if (session.ipAddress !== clientInfo.ipAddress) {
      this.lokiLogger.warn(`IP address mismatch attempt: ${JSON.stringify(errorContext)}`);

      return true;
    }

    return true;
  }
}

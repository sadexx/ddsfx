import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/libs/redis/services';
import { TokenService } from 'src/libs/tokens/services';
import { ILoginOtpState } from 'src/libs/temporal-state/common/interfaces';
import { IOtpVerificationOutput } from 'src/libs/temporal-state/common/outputs';
import { EAuthProvider } from 'src/modules/auth/common/enums';
import { IClientInfo } from 'src/common/interfaces';
import { LoginPhoneNumberDto } from 'src/modules/auth/common/dto';
import {
  NUMBER_OF_MINUTES_IN_FIVE_MINUTES,
  NUMBER_OF_MINUTES_IN_HOUR,
  NUMBER_OF_SECONDS_IN_MINUTE,
} from 'src/common/constants';

@Injectable()
export class OtpLoginRepository {
  private readonly PENDING_PREFIX = 'otp-login:session';
  private readonly TOKEN_INDEX_PREFIX = 'otp-login:token';
  private readonly OTP_STATE_TTL = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_FIVE_MINUTES;
  private readonly HOURLY_OTP_LIMIT = 5;
  private readonly OTP_ATTEMPT_TTL = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_HOUR;

  constructor(
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
  ) {}

  public async createPendingSession(clientInfo: IClientInfo, dto: LoginPhoneNumberDto, userId: string): Promise<void> {
    const redisKey = this.buildPendingKey(dto.phoneNumber);
    const loginOtpData = this.buildLoginOtpData(clientInfo, dto, userId);

    await this.redisService.setJson(redisKey, loginOtpData, this.OTP_STATE_TTL);
  }

  private buildLoginOtpData(clientInfo: IClientInfo, dto: LoginPhoneNumberDto, userId: string): ILoginOtpState {
    return {
      token: null,
      authProvider: EAuthProvider.PHONE_NUMBER,
      userId: userId,
      clientInfo: clientInfo,
      deviceInfo: dto.deviceInfo,
      networkMetadata: dto.networkMetadata,
    };
  }

  public async getSessionByPhone(phoneNumber: string, key?: string): Promise<ILoginOtpState> {
    const redisKey = key ? key : this.buildPendingKey(phoneNumber);
    const data = await this.redisService.getJson<ILoginOtpState>(redisKey);

    if (!data) {
      throw new NotFoundException('Login OTP data not found');
    }

    return data;
  }

  public async getSessionByToken(token: string, key?: string): Promise<ILoginOtpState> {
    const redisKey = key ? key : this.buildTokenIndexKey(token);
    const data = await this.redisService.getJson<ILoginOtpState>(redisKey);

    if (!data) {
      throw new NotFoundException('Login OTP data not found');
    }

    return data;
  }

  public async verifyAndGenerateToken(phoneNumber: string): Promise<IOtpVerificationOutput> {
    const redisKeyValidation = this.buildPendingKey(phoneNumber);
    const state = await this.getSessionByPhone(phoneNumber, redisKeyValidation);

    const otpVerificationToken = await this.tokenService.generateOtpVerificationToken();
    const redisKeyVerified = this.buildTokenIndexKey(otpVerificationToken);

    await this.redisService.setJson<ILoginOtpState>(
      redisKeyVerified,
      { ...state, token: otpVerificationToken },
      this.OTP_STATE_TTL,
    );
    await this.redisService.del(redisKeyValidation);

    return { otpVerificationToken };
  }

  public async checkOtpAttemptLimit(ipAddress: string): Promise<void> {
    const redisKey = `otp-login-attempt:${ipAddress}`;
    const attemptData = await this.redisService.getJson<{ ipAddress: string; attemptCount: number }>(redisKey);

    if (attemptData) {
      if (attemptData.attemptCount >= this.HOURLY_OTP_LIMIT) {
        throw new BadRequestException('Hourly OTP attempt limit exceeded');
      }

      attemptData.attemptCount += 1;
      await this.redisService.setJson(redisKey, attemptData, this.OTP_ATTEMPT_TTL);
    } else {
      const newAttemptData = {
        ipAddress: ipAddress,
        attemptCount: 1,
      };
      await this.redisService.setJson(redisKey, newAttemptData, this.OTP_ATTEMPT_TTL);
    }
  }

  private buildPendingKey(phoneNumber: string): string {
    return `${this.PENDING_PREFIX}:${phoneNumber}`;
  }

  private buildTokenIndexKey(token: string): string {
    return `${this.TOKEN_INDEX_PREFIX}:${token}`;
  }
}

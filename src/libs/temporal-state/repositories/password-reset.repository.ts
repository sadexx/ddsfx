import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  NUMBER_OF_MINUTES_IN_FIVE_MINUTES,
  NUMBER_OF_MINUTES_IN_HOUR,
  NUMBER_OF_SECONDS_IN_MINUTE,
} from 'src/common/constants';
import { RedisService } from 'src/libs/redis/services';
import { TokenService } from 'src/libs/tokens/services';
import { IOtpVerificationOutput } from 'src/libs/temporal-state/common/outputs';
import { IResetPasswordState } from 'src/libs/temporal-state/common/interfaces';

@Injectable()
export class PasswordResetRepository {
  private readonly PENDING_PREFIX = 'otp-password-reset:pending';
  private readonly ATTEMPT_PREFIX = 'otp-password-reset:attempt';
  private readonly OTP_STATE_TTL = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_FIVE_MINUTES;
  private readonly HOURLY_OTP_LIMIT = 5;
  private readonly OTP_ATTEMPT_TTL = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_HOUR;

  constructor(
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
  ) {}

  public async createState(email: string): Promise<IOtpVerificationOutput> {
    const otpVerificationToken = await this.tokenService.generateOtpVerificationToken();
    const redisKey = this.buildPendingKey(otpVerificationToken);

    const resetPasswordState: IResetPasswordState = {
      email: email,
      token: otpVerificationToken,
    };

    await this.redisService.setJson(redisKey, resetPasswordState, this.OTP_STATE_TTL);

    return { otpVerificationToken };
  }

  public async getStateByToken(token: string, key?: string): Promise<IResetPasswordState> {
    const redisKey = key ? key : this.buildPendingKey(token);
    const data = await this.redisService.getJson<IResetPasswordState>(redisKey);

    if (!data) {
      throw new NotFoundException('Password reset data not found');
    }

    return data;
  }

  public async checkOtpAttemptLimit(ipAddress: string): Promise<void> {
    const redisKey = `${this.ATTEMPT_PREFIX}:${ipAddress}`;
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

  private buildPendingKey(token: string): string {
    return `${this.PENDING_PREFIX}:${token}`;
  }
}

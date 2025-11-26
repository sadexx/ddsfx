import { BadRequestException, Injectable } from '@nestjs/common';
import { ENVIRONMENT, NUMBER_OF_MINUTES_IN_FIVE_MINUTES, NUMBER_OF_SECONDS_IN_MINUTE } from 'src/common/constants';
import { RedisService } from 'src/libs/redis/services';
import { generateCode } from 'src/common/utils';
import { OTP_FLOW_CONFIG } from 'src/modules/otp/common/constants';
import { IVerificationOtpData } from 'src/modules/otp/common/interfaces';
import { EOtpFlowType } from 'src/modules/otp/common/enum';
import { EEnvironment } from 'src/common/enums';
import { LokiLogger } from 'src/libs/logger';
import { AwsEndUserMessagingService } from 'src/libs/aws/end-user-messaging/services';

@Injectable()
export class OtpService {
  private readonly lokiLogger = new LokiLogger(OtpService.name);
  private readonly VERIFICATION_OTP_TTL = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_FIVE_MINUTES;

  constructor(
    private readonly redisService: RedisService,
    private readonly awsEndUserMessagingService: AwsEndUserMessagingService,
  ) {}

  /**
   * Builds a Redis key based on the given OTP flow type and code.
   * The key is in the format: `otp:{context}:{channel}:{code}`
   * @param flowType The OTP flow type.
   * @param code The OTP code.
   * @returns The built Redis key.
   * @example buildOtpRedisKey(EOtpFlowType.ADD_EMAIL, '123456') → "otp:registration:email:123456"
   */
  private buildOtpRedisKey(flowType: EOtpFlowType, code: string): string {
    const metadata = OTP_FLOW_CONFIG[flowType];

    return `otp:${metadata.context}:${metadata.channel}:${code}`;
  }

  private getDeliveryChannel(flowType: EOtpFlowType): string {
    const metadata = OTP_FLOW_CONFIG[flowType];

    return metadata.channel;
  }

  /**
   * Sends an OTP code to the given verification value.
   * The OTP code is stored in Redis with a TTL of 5 minutes.
   * @param flowType The OTP flow type.
   * @param verificationValue The verification value (e.g. email address or phone number) to send the OTP code to.
   * @returns A promise that resolves when the OTP code has been sent.
   */
  public async sendOtpCode(flowType: EOtpFlowType, verificationValue: string): Promise<void> {
    const otpCode = generateCode();
    const redisKey = this.buildOtpRedisKey(flowType, otpCode);

    const confirmationOtpData: IVerificationOtpData = {
      otpFlowType: flowType,
      verificationValue: verificationValue,
      code: otpCode,
    };
    await this.redisService.setJson(redisKey, confirmationOtpData, this.VERIFICATION_OTP_TTL);

    const channel = this.getDeliveryChannel(flowType);

    if (ENVIRONMENT === EEnvironment.LOCAL) {
      this.lokiLogger.debug(`Sending OTP code ${otpCode} to ${verificationValue} via ${channel}`);
    } else {
      await this.awsEndUserMessagingService.sendVerificationCode(verificationValue, otpCode);
    }
  }

  /**
   * Verifies the given OTP code with the cached OTP code in Redis.
   * @param flowType The OTP flow type.
   * @param verificationValue The verification value (e.g. email address or phone number) to verify the OTP code against.
   * @param code The OTP code to verify.
   * @returns A promise that resolves with true if the OTP code is valid, false otherwise.
   *
   * @throws BadRequestException if the OTP code is invalid or the verification value does not match.
   */
  public async verifyOtpCode(flowType: EOtpFlowType, verificationValue: string, code: string): Promise<boolean> {
    const redisKey = this.buildOtpRedisKey(flowType, code);
    const cachedData = await this.redisService.getJson<IVerificationOtpData>(redisKey);

    if (!cachedData) {
      throw new BadRequestException('Invalid verification code');
    }

    const { verificationValue: cachedVerificationValue, code: cachedCode } = cachedData;

    if (cachedVerificationValue !== verificationValue) {
      throw new BadRequestException('Invalid verification target');
    }

    if (cachedCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.redisService.del(redisKey);

    return true;
  }
}

import {
  MessageType,
  PinpointSMSVoiceV2Client,
  PinpointSMSVoiceV2ClientConfig,
  SendTextMessageCommand,
} from '@aws-sdk/client-pinpoint-sms-voice-v2';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LokiLogger } from 'src/libs/logger';
import { AwsConfigService } from 'src/libs/aws/config/services';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class AwsEndUserMessagingService {
  private readonly lokiLogger = new LokiLogger(AwsEndUserMessagingService.name);
  private readonly pinpointSmsV2Client: PinpointSMSVoiceV2Client;
  private readonly ORIGINAL_IDENTITY: string = 'FREYA';
  private readonly SMS_TTL_MINUTES: number;

  public constructor(
    private readonly configService: ConfigService,
    private readonly awsConfigService: AwsConfigService,
  ) {
    const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, REDIS_TTL_MINUTES } =
      this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.pinpointSmsV2Client = new PinpointSMSVoiceV2Client(
      this.awsConfigService.getStandardClientConfig<PinpointSMSVoiceV2ClientConfig>(
        AWS_REGION,
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
      ),
    );
    this.SMS_TTL_MINUTES = REDIS_TTL_MINUTES;
  }

  private async sendSmsMessage(phoneNumber: string, messageBody: string): Promise<void> {
    try {
      const command = new SendTextMessageCommand({
        DestinationPhoneNumber: phoneNumber,
        OriginationIdentity: this.ORIGINAL_IDENTITY,
        MessageBody: messageBody,
        MessageType: MessageType.TRANSACTIONAL,
      });
      await this.pinpointSmsV2Client.send(command);
    } catch (error) {
      this.lokiLogger.error(`Error sending SMS: ${(error as Error).message}`, (error as Error).stack);
      throw new ServiceUnavailableException('Failed to send SMS message');
    }
  }

  public async sendVerificationCode(phoneNumber: string, confirmationCode: string): Promise<string> {
    const messageBody = `Verification code: ${confirmationCode}. It will expire in ${this.SMS_TTL_MINUTES} minutes`;

    await this.sendSmsMessage(phoneNumber, messageBody);

    return confirmationCode;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { EEmailTemplateName } from 'src/libs/emailer/common/enums';
import { EmailerService } from 'src/libs/emailer/services';

@Injectable()
export class EmailsService {
  private readonly CODE_DURATION_MINUTES: number;

  constructor(
    private readonly mailService: EmailerService,
    private readonly configService: ConfigService,
  ) {
    const { REDIS_TTL_MINUTES } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.CODE_DURATION_MINUTES = REDIS_TTL_MINUTES;
  }

  public async sendConfirmationCode(email: string, emailConfirmationCode: string): Promise<string> {
    await this.mailService.sendMail({
      to: email,
      subject: `One Time Password Verification`,
      templateName: EEmailTemplateName.CONFIRMATION_CODE,
      context: {
        title: 'One Time Password Verification',
        code: emailConfirmationCode,
        codeDuration: this.CODE_DURATION_MINUTES,
      },
    });

    return `Code sent to the ${email}`;
  }
}

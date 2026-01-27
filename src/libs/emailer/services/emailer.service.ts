import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAILER_TRANSPORT } from 'src/libs/emailer/common/constants';
import { Transporter } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { EmailerTemplateService } from 'src/libs/emailer/services';
import { EEmailLayoutName, EEmailTemplateName } from 'src/libs/emailer/common/enums';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class EmailerService {
  private readonly FROM: string;

  constructor(
    @Inject(MAILER_TRANSPORT) private readonly transporter: Transporter<SMTPPool.SentMessageInfo>,
    private readonly configService: ConfigService,
    private readonly emailerTemplateService: EmailerTemplateService,
  ) {
    const { EMAIL_AUTHOR, EMAIL_AUTHOR_NAME } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.FROM = `"${EMAIL_AUTHOR_NAME}" <${EMAIL_AUTHOR}>`;
  }

  public async sendMail(options: {
    to: string;
    subject: string;
    templateName: EEmailTemplateName;
    context: Record<string, string | number | boolean | null | object>;
    layoutName?: EEmailLayoutName;
  }): Promise<void> {
    const html = this.emailerTemplateService.renderTemplate(options.templateName, options.context, options.layoutName);
    await this.transporter.sendMail({
      ...options,
      from: this.FROM,
      html,
    });
  }
}

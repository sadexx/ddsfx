import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { SMTP_SECURE_PORT } from 'src/common/constants';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { MAILER_TRANSPORT } from 'src/libs/emailer/common/constants';
import { EmailerService, EmailerTemplateService } from 'src/libs/emailer/services';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAILER_TRANSPORT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Transporter<SMTPPool.MailOptions> => {
        const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } =
          configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

        const transporter = createTransport({
          host: EMAIL_HOST,
          port: EMAIL_PORT,
          secure: EMAIL_PORT === SMTP_SECURE_PORT,
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
          },
        });

        return transporter;
      },
    },
    EmailerTemplateService,
    EmailerService,
  ],
  exports: [EmailerService],
})
export class EmailerModule {}

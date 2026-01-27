import { Module } from '@nestjs/common';
import { EmailerModule } from 'src/libs/emailer/emailer.module';
import { EmailsService } from 'src/modules/emails/services';

@Module({
  imports: [EmailerModule],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}

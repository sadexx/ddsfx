import { Module } from '@nestjs/common';
import { AwsEndUserMessagingModule } from 'src/libs/aws/end-user-messaging/aws-end-user-messaging.module';
import { TemporalStateModule } from 'src/libs/temporal-state/temporal-state.module';
import { OtpVerificationController } from 'src/modules/otp/controllers';
import { OtpService, OtpVerificationService } from 'src/modules/otp/services';

@Module({
  imports: [AwsEndUserMessagingModule, TemporalStateModule],
  controllers: [OtpVerificationController],
  providers: [OtpService, OtpVerificationService],
  exports: [OtpVerificationService],
})
export class OtpModule {}

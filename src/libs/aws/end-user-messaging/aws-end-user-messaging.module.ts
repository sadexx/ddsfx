import { Module } from '@nestjs/common';
import { AwsConfigModule } from 'src/libs/aws/config/aws-config.module';
import { AwsEndUserMessagingService } from 'src/libs/aws/end-user-messaging/services';

@Module({
  imports: [AwsConfigModule],
  controllers: [],
  providers: [AwsEndUserMessagingService],
  exports: [AwsEndUserMessagingService],
})
export class AwsEndUserMessagingModule {}

import { Module } from '@nestjs/common';
import { AwsConfigModule } from 'src/libs/aws/config/aws-config.module';
import { CloudFrontService } from 'src/libs/aws/cloud-front/services';

@Module({
  imports: [AwsConfigModule],
  controllers: [],
  providers: [CloudFrontService],
  exports: [CloudFrontService],
})
export class CloudFrontModule {}

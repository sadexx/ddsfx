import { Module } from '@nestjs/common';
import { AwsConfigModule } from 'src/libs/aws/config/aws-config.module';
import { AwsS3Service } from 'src/libs/aws/s3/services';

@Module({
  imports: [AwsConfigModule],
  controllers: [],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsS3Module {}

import { Module } from '@nestjs/common';
import { AwsConfigService } from 'src/libs/aws/config/services';

@Module({
  imports: [],
  controllers: [],
  providers: [AwsConfigService],
  exports: [AwsConfigService],
})
export class AwsConfigModule {}

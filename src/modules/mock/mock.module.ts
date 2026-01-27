import { Module } from '@nestjs/common';
import { MockOtpService } from 'src/modules/mock/services';

@Module({
  providers: [MockOtpService],
  exports: [MockOtpService],
})
export class MockModule {}

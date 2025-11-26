import { Module } from '@nestjs/common';
import { HealthService } from 'src/libs/health/services';
import { HealthController } from 'src/libs/health/controllers';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

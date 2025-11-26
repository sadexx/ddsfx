import { Controller, Get } from '@nestjs/common';
import { HealthService } from 'src/libs/health/services';

@Controller('health-check')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  public check(): string {
    return this.healthService.check();
  }
}

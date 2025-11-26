import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  public check(): string {
    return "I'm okay baby!";
  }
}

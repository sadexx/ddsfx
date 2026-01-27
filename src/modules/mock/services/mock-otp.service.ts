import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/libs/redis/services';
import { EnvConfig } from 'src/config/common/types';

@Injectable()
export class MockOtpService implements OnModuleInit {
  private readonly MOCK_OTP_CODE: string = '000000';
  private readonly MOCK_IDENTIFIERS_KEY = 'mock:otp:identifiers';
  private readonly MOCK_ENABLED: boolean;
  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly redisService: RedisService,
  ) {
    this.MOCK_ENABLED = this.configService.getOrThrow<boolean>('MOCK_ENABLED');
  }

  public async onModuleInit(): Promise<void> {
    if (!this.MOCK_ENABLED) {
      return;
    }

    const emails = this.configService.get<string>('MOCK_EMAILS') || '';
    const phones = this.configService.get<string>('MOCK_PHONES') || '';
    const identifiers = [...this.parseCommaSeparatedList(emails), ...this.parseCommaSeparatedList(phones)];

    if (identifiers.length === 0) {
      return;
    }

    await this.redisService.setJson(this.MOCK_IDENTIFIERS_KEY, identifiers, 0);
  }

  public async isMockedIdentifier(identifier: string): Promise<boolean> {
    if (!this.MOCK_ENABLED) {
      return false;
    }

    const identifiers = await this.redisService.getJson<string[]>(this.MOCK_IDENTIFIERS_KEY);

    if (!identifiers) {
      return false;
    }

    return identifiers.includes(identifier);
  }

  public getMockOtpCode(): string {
    return this.MOCK_OTP_CODE;
  }

  private parseCommaSeparatedList(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/common/types';
import { createHmac } from 'node:crypto';
import { NUMBER_OF_MILLISECONDS_IN_TEN_SECONDS } from 'src/common/constants';
import { IErrorWithCause } from 'src/libs/http-client/common/interfaces';
import { EHttpMethod } from 'src/libs/http-client/common/enum';
import { LokiLogger } from 'src/libs/logger';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class HttpRequestService {
  private readonly lokiLogger = new LokiLogger(HttpRequestService.name);
  private readonly API_KEY: string;
  private readonly API_SECRET: string;
  private readonly DEFAULT_USER_AGENT: string;

  public constructor(private readonly configService: ConfigService) {
    const { INTERNAL_API_KEY, INTERNAL_API_SECRET, DEFAULT_USER_AGENT } =
      this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

    this.API_KEY = INTERNAL_API_KEY;
    this.API_SECRET = INTERNAL_API_SECRET;
    this.DEFAULT_USER_AGENT = DEFAULT_USER_AGENT;
  }

  public async sendRequestExample(): Promise<unknown> {
    const requestType: string = 'verification';
    const url: string = 'https://example.com/';
    const timestamp = new Date().toISOString();
    const payload = { data: 1, timestamp };
    const signature = this.generateSignature(payload);

    const options: RequestInit = {
      method: EHttpMethod.GET,
      headers: {
        ...this.defaultHeaders(),
        'X-API-Key': this.API_KEY,
        'X-Request-Timestamp': timestamp,
        'X-Request-Signature': signature,
      },
      body: JSON.stringify({ data: 1 }),
      signal: AbortSignal.timeout(NUMBER_OF_MILLISECONDS_IN_TEN_SECONDS),
    };

    return await this.sendRequest<unknown>(url, options, requestType);
  }

  private async sendRequest<T>(url: string, options: RequestInit, requestType: string): Promise<T> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        this.lokiLogger.error(
          `Failed to send ${requestType} request, status: ${response.status}, message: ${response.statusText}`,
        );
        throw new Error();
      }

      return (await response.json()) as T;
    } catch (error) {
      const originalError = error as IErrorWithCause;

      if (originalError.cause) {
        const networkDetails = originalError.cause;
        this.lokiLogger.error(
          `Network error details in ${requestType} request: ${JSON.stringify({
            code: 'code' in networkDetails ? networkDetails.code : undefined,
            syscall: 'syscall' in networkDetails ? networkDetails.syscall : undefined,
            address: 'address' in networkDetails ? networkDetails.address : undefined,
            port: 'port' in networkDetails ? networkDetails.port : undefined,
          })}`,
        );
      }

      throw new ServiceUnavailableException(`Failed to send ${requestType} request`);
    }
  }

  private generateSignature(payload: { data: number; timestamp: string }): string {
    const data = JSON.stringify(payload);

    return createHmac('sha256', this.API_SECRET).update(data).digest('hex');
  }

  private defaultHeaders(): Record<string, string> {
    return {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/json',
      'X-Service-Name': 'fleet',
      'User-Agent': this.DEFAULT_USER_AGENT,
    };
  }
}

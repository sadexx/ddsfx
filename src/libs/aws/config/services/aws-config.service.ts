import { Injectable } from '@nestjs/common';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { IS_LOCAL } from 'src/common/constants';
import { AwsCredentialIdentity, AwsCredentialIdentityProvider } from '@aws-sdk/types';

@Injectable()
export class AwsConfigService {
  private readonly AWS_MAX_ATTEMPTS: number = 4;
  private readonly nodeHttpHandler: NodeHttpHandler;

  constructor() {
    this.nodeHttpHandler = new NodeHttpHandler({
      socketTimeout: 25000,
      connectionTimeout: 5000,
    });
  }

  public getStandardClientConfig<T>(region: string, AWS_ACCESS_KEY_ID?: string, AWS_SECRET_ACCESS_KEY?: string): T {
    const config = {
      region: region,
    } as T;

    if (IS_LOCAL) {
      const hasCredentials = AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY;

      return {
        ...config,
        credentials: hasCredentials
          ? ({
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
            } as AwsCredentialIdentity | AwsCredentialIdentityProvider)
          : undefined,
        requestHandler: this.nodeHttpHandler,
        maxAttempts: this.AWS_MAX_ATTEMPTS,
      };
    }

    return config;
  }
}

import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { LokiLogger } from 'src/libs/logger';
import { AwsConfigService } from 'src/libs/aws/config/services';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class CloudFrontService {
  private readonly lokiLogger = new LokiLogger(CloudFrontService.name);
  private readonly DEFAULT_CLOUDFRONT_REGION: string = 'us-east-1';
  private readonly cloudFrontClient: CloudFrontClient;
  private readonly DISTRIBUTION_ID: string;
  private readonly CLOUD_FRONT_DOMAIN_NAME: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly awsConfigService: AwsConfigService,
  ) {
    const { AWS_CLOUDFRONT_DISTRIBUTION_ID, AWS_CLOUDFRONT_DOMAIN_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
      this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.cloudFrontClient = new CloudFrontClient(
      this.awsConfigService.getStandardClientConfig<CloudFrontClient>(
        this.DEFAULT_CLOUDFRONT_REGION,
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
      ),
    );
    this.DISTRIBUTION_ID = AWS_CLOUDFRONT_DISTRIBUTION_ID;
    this.CLOUD_FRONT_DOMAIN_NAME = AWS_CLOUDFRONT_DOMAIN_NAME;
  }

  public getCloudFrontUrl(s3Key: string): string {
    return `https://${this.CLOUD_FRONT_DOMAIN_NAME}/${s3Key}`;
  }

  public async invalidateCache(fileKey: string): Promise<void> {
    try {
      const formattedPath = fileKey.startsWith('/') ? fileKey : `/${fileKey}`;

      const command = new CreateInvalidationCommand({
        DistributionId: this.DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: `${Date.now()}-${formattedPath}`,
          Paths: {
            Quantity: 1,
            Items: [formattedPath],
          },
        },
      });

      await this.cloudFrontClient.send(command);
    } catch (error) {
      this.lokiLogger.error(
        `Failed to invalidate CloudFront cache for key: ${fileKey}, message: ${(error as Error).message}`,
        (error as Error).stack,
      );

      throw new ServiceUnavailableException('Failed to clear CDN cache');
    }
  }

  public async invalidateCacheBatch(fileKeys: string[]): Promise<void> {
    try {
      const formattedPaths = fileKeys.map((key) => (key.startsWith('/') ? key : `/${key}`));

      const command = new CreateInvalidationCommand({
        DistributionId: this.DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: `${Date.now()}-batch-${fileKeys.length}`,
          Paths: {
            Quantity: formattedPaths.length,
            Items: formattedPaths,
          },
        },
      });

      await this.cloudFrontClient.send(command);
    } catch (error) {
      this.lokiLogger.error(
        `Failed to invalidate CloudFront cache for ${fileKeys.length} paths`,
        (error as Error).stack,
      );
      throw new ServiceUnavailableException('Failed to clear CDN cache');
    }
  }
}

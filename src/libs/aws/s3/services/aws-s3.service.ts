import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CompleteMultipartUploadCommandOutput,
  CopyObjectCommand,
  CopyObjectCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  ObjectIdentifier,
  S3Client,
  S3ClientConfig,
  StorageClass,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { AwsConfigService } from 'src/libs/aws/config/services';
import { LokiLogger } from 'src/libs/logger';
import { Readable } from 'stream';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class AwsS3Service {
  private readonly lokiLogger = new LokiLogger(AwsS3Service.name);
  private readonly s3Client: S3Client;
  private readonly S3_BUCKET_NAME: string;
  private readonly REGION: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly awsConfigService: AwsConfigService,
  ) {
    const { AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } =
      this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.s3Client = new S3Client(
      this.awsConfigService.getStandardClientConfig<S3ClientConfig>(
        AWS_REGION,
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
      ),
    );

    this.S3_BUCKET_NAME = AWS_S3_BUCKET_NAME;
    this.REGION = AWS_REGION;
  }

  public async uploadObject(
    key: string,
    body: ReadableStream | Readable,
    contentType: string,
    storageClass: StorageClass = StorageClass.STANDARD,
  ): Promise<CompleteMultipartUploadCommandOutput> {
    try {
      const commandToUploadFile = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: contentType,
          StorageClass: storageClass,
        },
      });

      return await commandToUploadFile.done();
    } catch (error) {
      this.lokiLogger.error(`Error uploading object:${(error as Error).message}`, (error as Error).stack);
      throw new ServiceUnavailableException('Failed to upload object');
    }
  }

  public async deleteObject(key: string): Promise<DeleteObjectCommandOutput> {
    try {
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        Key: key,
      });

      return await this.s3Client.send(deleteObjectCommand);
    } catch (error) {
      this.lokiLogger.error(`Error deleting object:${(error as Error).message}`, (error as Error).stack);
      throw new ServiceUnavailableException('File deletion failed');
    }
  }

  public async deleteObjects(objects: ObjectIdentifier[]): Promise<void> {
    try {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: this.S3_BUCKET_NAME,
        Delete: {
          Objects: objects,
        },
      });

      await this.s3Client.send(deleteObjectsCommand);
    } catch (error) {
      this.lokiLogger.error(`Error deleting objects:${(error as Error).message}`, (error as Error).stack);
      throw new ServiceUnavailableException('Failed to delete the selected files');
    }
  }

  public async copyObject(sourceKey: string, destinationKey: string): Promise<CopyObjectCommandOutput> {
    try {
      const copyObjectCommand = new CopyObjectCommand({
        Bucket: this.S3_BUCKET_NAME,
        CopySource: `/${this.S3_BUCKET_NAME}/${sourceKey}`,
        Key: destinationKey,
      });

      return await this.s3Client.send(copyObjectCommand);
    } catch (error) {
      this.lokiLogger.error(`Error copying object:${(error as Error).message}`, (error as Error).stack);
      throw new ServiceUnavailableException('Failed to copy object');
    }
  }

  public getObjectUrl(key: string): string {
    return `https://${this.S3_BUCKET_NAME}.s3.${this.REGION}.amazonaws.com/${key}`;
  }

  public getKeyFromUrl(url: string): string {
    const parsedUrl = new URL(url);

    return parsedUrl.pathname.slice(1);
  }
}

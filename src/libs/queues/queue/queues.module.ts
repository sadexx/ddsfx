import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueManagementService, WorkerManagementService } from 'src/libs/queues/queue/services';
import { BULLMQ_CONNECTION } from 'src/libs/queues/queue/common/constants';
import { QueueConsumerBridgeModule } from 'src/libs/queues/queue-consumer-bridge/queue-consumer-bridge.module';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Module({
  imports: [QueueConsumerBridgeModule],
  providers: [
    {
      provide: BULLMQ_CONNECTION,
      useFactory: (configService: ConfigService): { host: string; port: number } => {
        const { REDIS_HOST, REDIS_PORT } = configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

        return {
          host: REDIS_HOST,
          port: REDIS_PORT,
        };
      },
      inject: [ConfigService],
    },
    QueueManagementService,
    WorkerManagementService,
  ],
  exports: [QueueManagementService],
})
export class QueueModule {}

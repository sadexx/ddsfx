import { Module } from '@nestjs/common';
import { QueueConsumerBridgeService } from 'src/libs/queues/queue-consumer-bridge/services';

@Module({
  providers: [QueueConsumerBridgeService],
  exports: [QueueConsumerBridgeService],
})
export class QueueConsumerBridgeModule {}

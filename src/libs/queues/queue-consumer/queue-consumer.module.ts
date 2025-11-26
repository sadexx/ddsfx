import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { QueueConsumerService } from 'src/libs/queues/queue-consumer/services';
import { QueueConsumerBridgeModule } from 'src/libs/queues/queue-consumer-bridge/queue-consumer-bridge.module';
import { QueueConsumerBridgeService } from 'src/libs/queues/queue-consumer-bridge/services';

@Module({
  imports: [QueueConsumerBridgeModule],
  providers: [QueueConsumerService],
  exports: [],
})
export class QueueConsumerModule implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    private bridgeService: QueueConsumerBridgeService,
  ) {}

  onModuleInit(): void {
    const queueProcessor = this.moduleRef.get(QueueConsumerService);
    this.bridgeService.registerProcessor(queueProcessor);
  }
}

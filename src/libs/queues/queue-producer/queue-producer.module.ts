import { Module } from '@nestjs/common';
import { QueueProducerService } from 'src/libs/queues/queue-producer/services';
import { QueueModule } from 'src/libs/queues/queue/queues.module';

@Module({
  imports: [QueueModule],
  providers: [QueueProducerService],
  exports: [QueueProducerService],
})
export class QueueProducerModule {}

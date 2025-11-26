import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Job } from 'bullmq';
import { LokiLogger } from 'src/libs/logger';
import { IQueueConsumer } from 'src/libs/queues/queue-consumer/common/interfaces';
import { EQueueType } from 'src/libs/queues/queue/common/enums';
import { IQueueJobType } from 'src/libs/queues/queue/common/interfaces';

/**
 * Bridge service that acts as a proxy to delegate job processing to a registered queue processor.
 *
 * This service implements the Bridge pattern to decouple the queue management from the actual
 * job processing logic. It maintains a static reference to the actual processor and delegates
 * all processing calls to it.
 *
 * `IQueueConsumer` - Interface defining queue processing contract.
 *
 * `WorkerManagementService` - Service that uses this bridge for job processing
 */
@Injectable()
export class QueueConsumerBridgeService implements IQueueConsumer {
  private static processorInstance: IQueueConsumer | null = null;
  private readonly logger = new LokiLogger(QueueConsumerBridgeService.name);

  /**
   * Registers the queue processor instance with this bridge service.
   *
   * This method is typically called during application initialization to set up
   * the actual processor that will handle job processing requests. Once registered,
   * all calls to {@link processJob} will be delegated to this processor.
   *
   * @param processor - The queue processor service to be registered
   *
   */
  registerProcessor(processor: IQueueConsumer): void {
    this.logger.debug('Queue processor registered successfully');
    QueueConsumerBridgeService.processorInstance = processor;
  }

  /**
   * Processes a job by delegating to the registered queue processor.
   *
   * This method acts as a proxy, forwarding the job processing request to the
   * registered processor instance. If no processor is registered, it throws an
   * InternalServerErrorException with guidance on module initialization.
   *
   * @param queueEnum - The type of queue the job belongs to
   * @param job - The BullMQ job instance containing job data and metadata
   *
   */
  async processJob(queueEnum: EQueueType, job: Job<IQueueJobType>): Promise<void> {
    if (!QueueConsumerBridgeService.processorInstance) {
      this.logger.error('Queue processor not registered. Check module initialization order.');
      throw new InternalServerErrorException(
        'Queue processor not registered. Ensure QueueProcessorsModule is imported in the app.',
      );
    }

    return QueueConsumerBridgeService.processorInstance.processJob(queueEnum, job);
  }
}

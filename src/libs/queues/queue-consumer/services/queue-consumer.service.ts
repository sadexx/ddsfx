import { Injectable } from '@nestjs/common';
import { IQueueConsumer } from 'src/libs/queues/queue-consumer/common/interfaces';
import { Job } from 'bullmq';
import { LokiLogger } from 'src/libs/logger';
import { EJobType, EQueueType } from 'src/libs/queues/queue/common/enums';
import { IQueueJobType } from 'src/libs/queues/queue/common/interfaces';

@Injectable()
export class QueueConsumerService implements IQueueConsumer {
  private readonly lokiLogger = new LokiLogger(QueueConsumerService.name);
  constructor() {}

  public async processJob(queueEnum: EQueueType, job: Job<IQueueJobType>): Promise<void> {
    switch (queueEnum) {
      case EQueueType.PAYMENTS_QUEUE:
        return this.handlePaymentsJob(job);
      case EQueueType.NOTIFICATIONS_QUEUE:
        return this.handleNotificationsJob(job);
      case EQueueType.WEBHOOKS_QUEUE:
        return this.handleWebhooksJob(job);

      default:
        return this.handleDefaultJob(job);
    }
  }

  private async handlePaymentsJob(job: Job<IQueueJobType>): Promise<void> {
    switch (job.data.jobName) {
      case EJobType.PROCESS_PAYMENT: {
        const { paymentId } = job.data.payload;

        this.lokiLogger.log(`Processing payment for payment ID: ${paymentId}`);

        return Promise.resolve();
      }
      default:
        return this.handleUnknownJob(job);
    }
  }

  private async handleNotificationsJob(job: Job<IQueueJobType>): Promise<void> {
    switch (job.data.jobName) {
      case EJobType.PROCESS_NOTIFY_USERS: {
        const { userId, message } = job.data.payload;
        this.lokiLogger.log(`Processing notification for user ID: ${userId}, message: ${message}`);

        return Promise.resolve();
      }
      default:
        return this.handleUnknownJob(job);
    }
  }

  private async handleWebhooksJob(job: Job<IQueueJobType>): Promise<void> {
    switch (job.data.jobName) {
      case EJobType.PROCESS_TRIAL_WEBHOOK: {
        const { message, webhookId } = job.data.payload;
        this.lokiLogger.log(`Processing trial webhook: ${message}, webhook ID: ${webhookId}`);

        return Promise.resolve();
      }

      default:
        return this.handleUnknownJob(job);
    }
  }

  private handleDefaultJob(job: Job): void {
    switch (job.name) {
      default:
        return this.handleUnknownJob(job);
    }
  }

  private handleUnknownJob(job: Job): void {
    this.lokiLogger.error(`Received unknown job: #${job.id}, name:[${job.name}], data: ${JSON.stringify(job.data)}`);
  }
}

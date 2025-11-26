import { Injectable } from '@nestjs/common';
import { QueueManagementService } from 'src/libs/queues/queue/services';
import { IQueueData, IQueueDataBulk } from 'src/libs/queues/queue/common/interfaces';
import { EJobType, EQueueType } from 'src/libs/queues/queue/common/enums';

@Injectable()
export class QueueProducerService {
  constructor(private readonly queueManagementService: QueueManagementService) {}

  public async addProcessPaymentQueue(paymentId: string): Promise<void> {
    const jobData: IQueueData = {
      queueEnum: EQueueType.PAYMENTS_QUEUE,
      jobItem: {
        jobName: EJobType.PROCESS_PAYMENT,
        payload: { paymentId },
      },
    };

    await this.queueManagementService.addJob(jobData, { jobId: `process-payment:${paymentId}` });
  }

  public async addProcessNotificationQueue(sqsMessages: { message: string; userId: string }[]): Promise<void> {
    const jobData: IQueueDataBulk = {
      queueEnum: EQueueType.NOTIFICATIONS_QUEUE,
      jobItems: sqsMessages.map((message) => ({
        jobName: EJobType.PROCESS_NOTIFY_USERS,
        payload: message,
      })),
    };
    await this.queueManagementService.addBulk(jobData);
  }

  public async addProcessWebhookQueue(sqsMessages: { message: string; webhookId: string }[]): Promise<void> {
    const jobData: IQueueDataBulk = {
      queueEnum: EQueueType.WEBHOOKS_QUEUE,
      jobItems: sqsMessages.map((message) => ({
        jobName: EJobType.PROCESS_TRIAL_WEBHOOK,
        payload: message,
      })),
    };
    await this.queueManagementService.addBulk(jobData);
  }
}

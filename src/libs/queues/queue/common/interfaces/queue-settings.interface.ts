import { QueueOptions } from 'bullmq';
import { EQueueType } from 'src/libs/queues/queue/common/enums';

export interface IQueueSettings {
  queueName: EQueueType;
  queueOptions: Omit<QueueOptions, 'connection'>;
}

import { QueueOptions } from 'bullmq';
import { EQueueType } from 'src/libs/queues/queue/common/enums';
import { StrictOmit } from 'src/common/types';

export interface IQueueSettings {
  queueName: EQueueType;
  queueOptions: StrictOmit<QueueOptions, 'connection'>;
}

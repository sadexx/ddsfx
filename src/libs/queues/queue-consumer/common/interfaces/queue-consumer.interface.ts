import { Job } from 'bullmq';
import { EQueueType } from 'src/libs/queues/queue/common/enums';
import { IQueueJobType } from 'src/libs/queues/queue/common/interfaces';

export interface IQueueConsumer {
  processJob(queueEnum: EQueueType, job: Job<IQueueJobType>): Promise<void>;
}

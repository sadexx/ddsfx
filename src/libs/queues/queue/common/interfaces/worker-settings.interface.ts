import { WorkerOptions } from 'bullmq';
import { EQueueType } from 'src/libs/queues/queue/common/enums';
import { StrictOmit } from 'src/common/types';

export interface IWorkerSettings {
  queueName: EQueueType;
  workerOptions: StrictOmit<WorkerOptions, 'connection'>;
}

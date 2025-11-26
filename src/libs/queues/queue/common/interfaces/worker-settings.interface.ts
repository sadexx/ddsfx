import { WorkerOptions } from 'bullmq';
import { EQueueType } from 'src/libs/queues/queue/common/enums';

export interface IWorkerSettings {
  queueName: EQueueType;
  workerOptions: Omit<WorkerOptions, 'connection'>;
}

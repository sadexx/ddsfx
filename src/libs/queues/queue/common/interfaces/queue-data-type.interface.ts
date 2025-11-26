import { EJobType, EQueueType } from 'src/libs/queues/queue/common/enums';

export interface IQueueData {
  queueEnum: EQueueType;
  jobItem: IQueueJobType;
}

export interface IQueueDataBulk {
  queueEnum: EQueueType;
  jobItems: IQueueJobType[];
}

export interface IProcessPaymentData {
  jobName: EJobType.PROCESS_PAYMENT;
  payload: { paymentId: string };
}

export interface IProcessNotifyUsersData {
  jobName: EJobType.PROCESS_NOTIFY_USERS;
  payload: { message: string; userId: string };
}

export interface IProcessWebhookData {
  jobName: EJobType.PROCESS_TRIAL_WEBHOOK;
  payload: { message: string; webhookId: string };
}

export type IQueueJobType = IProcessPaymentData | IProcessNotifyUsersData | IProcessWebhookData;

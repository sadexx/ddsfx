import { ValuesOf } from 'src/common/types';

export const EUserAvatarStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
} as const;

export type EUserAvatarStatus = ValuesOf<typeof EUserAvatarStatus>;

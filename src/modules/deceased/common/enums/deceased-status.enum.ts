import { ValuesOf } from 'src/common/types';

export const EDeceasedStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
} as const;

export type EDeceasedStatus = ValuesOf<typeof EDeceasedStatus>;

import { ValuesOf } from 'src/common/types';

export const EAccountStatus = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
  BANNED: 'banned',
} as const;

export type EAccountStatus = ValuesOf<typeof EAccountStatus>;

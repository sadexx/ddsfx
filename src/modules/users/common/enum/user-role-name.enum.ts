import { ValuesOf } from 'src/common/types';

export const EUserRoleName = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type EUserRoleName = ValuesOf<typeof EUserRoleName>;

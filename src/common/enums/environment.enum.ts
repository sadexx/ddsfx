import { ValuesOf } from 'src/common/types';

export const EEnvironment = {
  LOCAL: 'local',
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

export type EEnvironment = ValuesOf<typeof EEnvironment>;

import { ValuesOf } from 'src/common/types';

export const EBucketName = {
  FREYA_MEMORY: 'freya-memory',
  FREYA_CITY_DEV: 'freya-city-dev',
  FREYA_CITY_LOCAL: 'freya-city-local',
  FREYA_CITY_STAGE: 'freya-city-stage',
  FREYA_CITY_PROD: 'freya-city-prod',
} as const;

export type EBucketName = ValuesOf<typeof EBucketName>;

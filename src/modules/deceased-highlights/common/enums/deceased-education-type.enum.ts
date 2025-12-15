import { ValuesOf } from 'src/common/types';

export const EDeceasedEducationType = {
  SECONDARY: 'secondary',
  HIGHER: 'higher',
} as const;

export type EDeceasedEducationType = ValuesOf<typeof EDeceasedEducationType>;

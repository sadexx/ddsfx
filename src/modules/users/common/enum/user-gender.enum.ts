import { ValuesOf } from 'src/common/types';

export const EUserGender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export type EUserGender = ValuesOf<typeof EUserGender>;

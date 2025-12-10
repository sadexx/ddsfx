import { ValuesOf } from 'src/common/types';

export const EKinshipType = {
  MOTHER: 'mother',
  FATHER: 'father',
  DAUGHTER: 'daughter',
  SON: 'son',
  SISTER: 'sister',
  BROTHER: 'brother',
} as const;

export type EKinshipType = ValuesOf<typeof EKinshipType>;

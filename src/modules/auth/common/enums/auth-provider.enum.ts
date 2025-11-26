import { ValuesOf } from 'src/common/types';

export const EAuthProvider = {
  GOOGLE: 'google',
  APPLE: 'apple',
  FACEBOOK: 'facebook',
  EMAIL: 'email',
  PHONE_NUMBER: 'phone-number',
} as const;

export type EAuthProvider = ValuesOf<typeof EAuthProvider>;

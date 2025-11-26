import { ValuesOf } from 'src/common/types';

export const ERegistrationStrategy = {
  EMAIL: 'email',
  PHONE_NUMBER: 'phone-number',
  GOOGLE: 'google',
  APPLE: 'apple',
  FACEBOOK: 'facebook',
} as const;

export type ERegistrationStrategy = ValuesOf<typeof ERegistrationStrategy>;

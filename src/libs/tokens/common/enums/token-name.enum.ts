import { ValuesOf } from 'src/common/types';

export const ETokenName = {
  REGISTRATION_TOKEN: 'registrationToken',
  OTP_VERIFICATION_TOKEN: 'otpVerificationToken',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ID_TOKEN: 'idToken',
} as const;

export type ETokenName = ValuesOf<typeof ETokenName>;

import { ValuesOf } from 'src/common/types';

export const EOpaqueTokenType = {
  REGISTRATION: 'reg',
  OTP_VERIFICATION: 'otp',
  ACCESS: 'acc',
  REFRESH: 'ref',
} as const;

export type EOpaqueTokenType = ValuesOf<typeof EOpaqueTokenType>;

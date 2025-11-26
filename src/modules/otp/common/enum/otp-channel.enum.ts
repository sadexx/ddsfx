import { ValuesOf } from 'src/common/types';

export const EOtpChannel = {
  EMAIL: 'email',
  PHONE_NUMBER: 'phone-number',
} as const;

export type EOtpChannel = ValuesOf<typeof EOtpChannel>;

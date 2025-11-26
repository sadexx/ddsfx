import { ValuesOf } from 'src/common/types';

export const EOtpContext = {
  REGISTRATION: 'registration',
  VERIFICATION: 'verification',
} as const;

export type EOtpContext = ValuesOf<typeof EOtpContext>;

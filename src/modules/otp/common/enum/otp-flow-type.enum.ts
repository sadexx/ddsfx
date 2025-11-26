import { ValuesOf } from 'src/common/types';

export const EOtpFlowType = {
  /**
   ** Registration flows
   */
  ADD_EMAIL: 'add-email',
  ADD_PHONE_NUMBER: 'add-phone-number',

  /**
   ** Authenticated flows
   */
  LOGIN: 'login',
  CHANGE_EMAIL: 'change-email',
  CHANGE_PHONE_NUMBER: 'change-phone-number',
  RESET_PASSWORD: 'reset-password',
  CHANGE_PASSWORD: 'change-password',
} as const;

export type EOtpFlowType = ValuesOf<typeof EOtpFlowType>;

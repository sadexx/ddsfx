import { ValuesOf } from 'src/common/types';

export const ERegistrationStep = {
  ADD_EMAIL: 'add-email',
  VERIFY_EMAIL: 'verify-email',
  CREATE_PASSWORD: 'create-password',
  ADD_PHONE: 'add-phone',
  VERIFY_PHONE: 'verify-phone',
  CONDITIONS_AGREEMENT: 'conditions-agreement',
  FINISH: 'finish',
} as const;

export type ERegistrationStep = ValuesOf<typeof ERegistrationStep>;

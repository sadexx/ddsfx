import { ERegistrationStep } from 'src/modules/auth/common/enums';

export interface IRegistrationStep {
  index: number;
  name: ERegistrationStep;
  isCompleted: boolean;
}

import { IRegistrationStep } from 'src/modules/auth/common/interfaces';

export interface IStartRegistrationOutput {
  registrationToken: string;
  registrationSteps: IRegistrationStep[];
}

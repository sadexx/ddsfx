import { EUserRoleName } from 'src/modules/users/common/enum';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';

export interface IUserRegistrationCompletion {
  authProvider: ERegistrationStrategy;
  role: EUserRoleName;
  email: string | null;
  isVerifiedEmail: boolean;
  password: string | null;
  phoneNumber: string | null;
  isVerifiedPhoneNumber: boolean;
}

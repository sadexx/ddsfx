import { IClientInfo } from 'src/common/interfaces';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';
import { DeviceInfoDto, NetworkMetadataDto } from 'src/modules/auth/common/dto';

export interface IRegistrationState {
  registrationToken: string;
  registeredUserId: string | null;
  roleName: EUserRoleName;
  authProvider: ERegistrationStrategy;
  email: string | null;
  emailVerificationAttempts: number;
  lastEmailVerificationAttempt: string | null;
  isVerifiedEmail: boolean;
  password: string | null;
  phoneNumber: string | null;
  phoneVerificationAttempts: number;
  lastPhoneVerificationAttempt: string | null;
  isVerifiedPhoneNumber: boolean;
  isAgreedToConditions: boolean;
  clientInfo: IClientInfo;
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;
}

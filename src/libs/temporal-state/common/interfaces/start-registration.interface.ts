import { IClientInfo } from 'src/common/interfaces';
import { DeviceInfoDto, NetworkMetadataDto } from 'src/modules/auth/common/dto';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';
import { EUserRoleName } from 'src/modules/users/common/enum';

export interface IStartRegistration {
  registrationToken: string;
  registrationStrategy: ERegistrationStrategy;
  roleName: EUserRoleName;
  email?: string;
  isVerifiedEmail?: boolean;
  clientInfo: IClientInfo;
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;
}

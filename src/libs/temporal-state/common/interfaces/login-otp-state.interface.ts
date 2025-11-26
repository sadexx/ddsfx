import { IClientInfo } from 'src/common/interfaces';
import { EAuthProvider } from 'src/modules/auth/common/enums';
import { DeviceInfoDto, NetworkMetadataDto } from 'src/modules/auth/common/dto';

export interface ILoginOtpState {
  token: string | null;
  authProvider: EAuthProvider;
  userId: string;
  clientInfo: IClientInfo;
  deviceInfo: DeviceInfoDto;
  networkMetadata: NetworkMetadataDto;
}

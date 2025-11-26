import { DeviceInfoDto, NetworkMetadataDto } from 'src/modules/auth/common/dto';

export interface IStartSessionInfo {
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;
}

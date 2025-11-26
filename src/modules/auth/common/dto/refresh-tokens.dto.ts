import { Type } from '@sinclair/typebox';
import { NetworkMetadataDto } from 'src/modules/auth/common/dto/network-metadata.dto';
import { DeviceInfoDto } from 'src/modules/auth/common/dto/device-info.dto';

export class RefreshTokensDto {
  networkMetadata?: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;

  static readonly schema = Type.Object({
    networkMetadata: Type.Optional(NetworkMetadataDto.schema),
    deviceInfo: DeviceInfoDto.schema,
  });
}

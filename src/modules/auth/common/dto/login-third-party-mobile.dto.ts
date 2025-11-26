import { Type } from '@sinclair/typebox';
import { NetworkMetadataDto } from 'src/modules/auth/common/dto/network-metadata.dto';
import { DeviceInfoDto } from 'src/modules/auth/common/dto/device-info.dto';

export class LoginThirdPartyMobileDto {
  idToken: string;
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;

  static readonly schema = Type.Object(
    {
      idToken: Type.String(),
      networkMetadata: NetworkMetadataDto.schema,
      deviceInfo: DeviceInfoDto.schema,
    },
    { additionalProperties: false },
  );
}

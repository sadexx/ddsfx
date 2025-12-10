import { Type } from '@sinclair/typebox';
import { NetworkMetadataDto } from 'src/modules/auth/common/dto/network-metadata.dto';
import { DeviceInfoDto } from 'src/modules/auth/common/dto/device-info.dto';
import { UUIDPattern } from 'src/common/validators';

export class RefreshTokensDto {
  sessionId: string;
  networkMetadata?: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;

  static readonly schema = Type.Object(
    {
      sessionId: UUIDPattern,
      networkMetadata: Type.Optional(NetworkMetadataDto.schema),
      deviceInfo: DeviceInfoDto.schema,
    },
    { additionalProperties: false },
  );
}

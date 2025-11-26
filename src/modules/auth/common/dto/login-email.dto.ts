import { Type } from '@sinclair/typebox';
import { EmailPattern, PasswordPattern } from 'src/common/validators';
import { NetworkMetadataDto } from 'src/modules/auth/common/dto/network-metadata.dto';
import { DeviceInfoDto } from 'src/modules/auth/common/dto/device-info.dto';

export class LoginEmailDto {
  email: string;
  password: string;
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;

  static readonly schema = Type.Object(
    {
      email: EmailPattern,
      password: PasswordPattern,
      networkMetadata: NetworkMetadataDto.schema,
      deviceInfo: DeviceInfoDto.schema,
    },
    { additionalProperties: false },
  );
}

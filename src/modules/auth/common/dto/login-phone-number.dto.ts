import { Type } from '@sinclair/typebox';
import { PhoneNumberPattern } from 'src/common/validators';
import { NetworkMetadataDto } from 'src/modules/auth/common/dto/network-metadata.dto';
import { DeviceInfoDto } from 'src/modules/auth/common/dto/device-info.dto';

export class LoginPhoneNumberDto {
  phoneNumber: string;
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;

  static readonly schema = Type.Object(
    {
      phoneNumber: PhoneNumberPattern,
      networkMetadata: NetworkMetadataDto.schema,
      deviceInfo: DeviceInfoDto.schema,
    },
    { additionalProperties: false },
  );
}

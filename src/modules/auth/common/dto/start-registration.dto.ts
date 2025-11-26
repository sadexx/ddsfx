import { Type } from '@sinclair/typebox';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';
import { NetworkMetadataDto } from 'src/modules/auth/common/dto/network-metadata.dto';
import { DeviceInfoDto } from 'src/modules/auth/common/dto/device-info.dto';

export class StartRegistrationDto {
  roleName: Exclude<EUserRoleName, 'super-admin' | 'admin'>;
  registrationStrategy: Exclude<ERegistrationStrategy, 'email' | 'google' | 'apple' | 'facebook'>;
  networkMetadata: NetworkMetadataDto;
  deviceInfo: DeviceInfoDto;

  static readonly schema = Type.Object(
    {
      roleName: Type.Literal(EUserRoleName.USER),
      registrationStrategy: Type.Literal(ERegistrationStrategy.PHONE_NUMBER),
      networkMetadata: NetworkMetadataDto.schema,
      deviceInfo: DeviceInfoDto.schema,
    },
    { additionalProperties: false },
  );
}

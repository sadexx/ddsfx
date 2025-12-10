import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';
import { EPlatformType } from 'src/modules/sessions/common/enum';

export class DeviceInfoDto {
  platform: EPlatformType;
  pushNotificationToken: string | null;
  appVersion: string;
  osVersion: string;
  deviceModel: string;

  static readonly schema = Type.Object(
    {
      platform: Type.Enum(EPlatformType),
      pushNotificationToken: Type.Union([StandardStringPattern, Type.Null()]),
      appVersion: StandardStringPattern,
      osVersion: StandardStringPattern,
      deviceModel: StandardStringPattern,
    },
    { additionalProperties: false },
  );
}

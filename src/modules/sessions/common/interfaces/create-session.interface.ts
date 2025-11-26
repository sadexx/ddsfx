import { EAuthProvider } from 'src/modules/auth/common/enums';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { EPlatformType } from 'src/modules/sessions/common/enum';

export interface ICreateSession {
  roleName: EUserRoleName;
  authProvider: EAuthProvider;
  refreshToken: string;
  refreshTokenExpirationDate: Date;
  ipAddress: string;
  userAgent: string;
  platform: EPlatformType;
  deviceId: string;
  pushNotificationToken: string | null;
  appVersion: string;
  osVersion: string;
  deviceModel: string;
  clientIp: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

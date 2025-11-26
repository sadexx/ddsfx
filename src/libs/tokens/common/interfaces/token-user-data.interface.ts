import { EUserRoleName } from 'src/modules/users/common/enum';

export interface ITokenUserPayload {
  sub: string;
  sessionId: string;
  roleName: EUserRoleName;
}

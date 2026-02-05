import { Type } from '@sinclair/typebox';
import { PasswordPattern } from 'src/common/validators';

export class SetPasswordDto {
  newPassword: string;

  static readonly schema = Type.Object({ newPassword: PasswordPattern }, { additionalProperties: false });
}

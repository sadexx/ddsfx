import { Type } from '@sinclair/typebox';
import { PasswordPattern } from 'src/common/validators';

export class AddPasswordDto {
  password: string;

  static readonly schema = Type.Object({ password: PasswordPattern }, { additionalProperties: false });
}

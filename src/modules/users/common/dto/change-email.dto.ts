import { Type } from '@sinclair/typebox';
import { EmailPattern } from 'src/common/validators';

export class ChangeEmailDto {
  newEmail: string;

  static readonly schema = Type.Object({ newEmail: EmailPattern }, { additionalProperties: false });
}

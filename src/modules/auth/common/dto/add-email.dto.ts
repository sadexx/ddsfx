import { Type } from '@sinclair/typebox';
import { EmailPattern } from 'src/common/validators';

export class AddEmailDto {
  email: string;

  static readonly schema = Type.Object({ email: EmailPattern }, { additionalProperties: false });
}

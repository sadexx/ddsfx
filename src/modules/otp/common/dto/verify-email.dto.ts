import { Type } from '@sinclair/typebox';
import { EmailPattern, OtpCodePattern } from 'src/common/validators';

export class VerifyEmailDto {
  email: string;
  code: string;

  static readonly schema = Type.Object({ email: EmailPattern, code: OtpCodePattern }, { additionalProperties: false });
}

import { Type } from '@sinclair/typebox';
import { OtpCodePattern, PhoneNumberPattern } from 'src/common/validators';

export class VerifyPhoneNumberDto {
  phoneNumber: string;
  code: string;

  static readonly schema = Type.Object(
    { phoneNumber: PhoneNumberPattern, code: OtpCodePattern },
    { additionalProperties: false },
  );
}

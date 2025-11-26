import { Type } from '@sinclair/typebox';
import { PhoneNumberPattern } from 'src/common/validators';

export class AddPhoneNumberDto {
  phoneNumber: string;

  static readonly schema = Type.Object({ phoneNumber: PhoneNumberPattern }, { additionalProperties: false });
}

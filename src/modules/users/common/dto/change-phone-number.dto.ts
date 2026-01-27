import { Type } from '@sinclair/typebox';
import { PhoneNumberPattern } from 'src/common/validators';

export class ChangePhoneNumberDto {
  newPhoneNumber: string;

  static readonly schema = Type.Object({ newPhoneNumber: PhoneNumberPattern }, { additionalProperties: false });
}

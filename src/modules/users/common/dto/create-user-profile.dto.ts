import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';

export class CreateUserProfileDto {
  firstName: string;
  lastName: string;
  middleName: string;

  static readonly schema = Type.Object(
    {
      firstName: StandardStringPattern,
      lastName: StandardStringPattern,
      middleName: StandardStringPattern,
    },
    { additionalProperties: false },
  );
}

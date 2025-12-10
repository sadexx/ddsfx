import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';

export class UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;

  static readonly schema = Type.Object(
    {
      firstName: Type.Optional(StandardStringPattern),
      lastName: Type.Optional(StandardStringPattern),
      middleName: Type.Optional(StandardStringPattern),
    },
    { additionalProperties: false },
  );
}

import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern } from 'src/common/validators';
export class UpdatePostDto {
  text: string | null;

  static readonly schema = Type.Object(
    {
      text: Type.Union([ExtendedStringPattern, Type.Null()]),
    },
    { additionalProperties: false },
  );
}

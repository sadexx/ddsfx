import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern, UUIDPattern } from 'src/common/validators';

export class UpdatePostDto {
  text?: string | null;
  templateId?: string;

  static readonly schema = Type.Object(
    {
      text: Type.Optional(Type.Union([ExtendedStringPattern, Type.Null()])),
      templateId: Type.Optional(UUIDPattern),
    },
    { additionalProperties: false },
  );
}

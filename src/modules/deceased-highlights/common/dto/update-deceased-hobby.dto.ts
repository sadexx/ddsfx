import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';

export class UpdateDeceasedHobbyDto {
  description?: string;
  tagIds?: string[];

  static readonly schema = Type.Object(
    {
      description: Type.Optional(StandardStringPattern),
      tagIds: Type.Optional(Type.Array(Type.String(UUIDPattern), { minItems: 0, maxItems: 20 })),
    },
    { additionalProperties: false },
  );
}

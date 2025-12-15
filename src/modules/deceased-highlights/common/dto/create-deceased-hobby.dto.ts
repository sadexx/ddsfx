import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';

export class CreateDeceasedHobbyDto {
  description: string;
  tagIds?: string[];

  static readonly schema = Type.Object({
    description: StandardStringPattern,
    tagIds: Type.Optional(Type.Array(Type.String(UUIDPattern), { uniqueItems: true, minItems: 1, maxItems: 20 })),
  });
}

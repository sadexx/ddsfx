import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';

export class UpdateFaqItemDto {
  question?: string;
  answer?: string;
  categoryId?: string;

  static readonly schema = Type.Object(
    {
      question: Type.Optional(StandardStringPattern),
      answer: Type.Optional(StandardStringPattern),
      categoryId: Type.Optional(UUIDPattern),
    },
    { additionalProperties: false },
  );
}

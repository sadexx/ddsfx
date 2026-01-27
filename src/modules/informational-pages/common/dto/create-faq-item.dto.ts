import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';

export class CreateFaqItemDto {
  question: string;
  answer: string;
  categoryId: string;

  static readonly schema = Type.Object(
    { question: StandardStringPattern, answer: StandardStringPattern, categoryId: UUIDPattern },
    { additionalProperties: false },
  );
}

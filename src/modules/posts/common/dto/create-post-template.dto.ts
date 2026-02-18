import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';
import { EPostTemplateType } from 'src/modules/posts/common/enums';

export class CreatePostTemplateDto {
  id: string;
  postType: EPostTemplateType;
  text?: string;

  static readonly schema = Type.Object(
    { id: UUIDPattern, postType: Type.Enum(EPostTemplateType), text: Type.Optional(StandardStringPattern) },
    { additionalProperties: false },
  );
}

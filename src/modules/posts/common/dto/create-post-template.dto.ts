import { Type } from '@sinclair/typebox';
import { UUIDPattern } from 'src/common/validators';

export class CreatePostTemplateDto {
  id: string;

  static readonly schema = Type.Object({ id: UUIDPattern }, { additionalProperties: false });
}

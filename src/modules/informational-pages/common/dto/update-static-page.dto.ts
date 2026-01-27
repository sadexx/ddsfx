import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern } from 'src/common/validators';

export class UpdateStaticPageDto {
  content: string;

  static readonly schema = Type.Object({ content: ExtendedStringPattern }, { additionalProperties: false });
}

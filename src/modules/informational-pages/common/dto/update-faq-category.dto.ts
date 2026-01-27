import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';

export class UpdateFaqCategoryDto {
  name: string;

  static readonly schema = Type.Object({ name: StandardStringPattern }, { additionalProperties: false });
}

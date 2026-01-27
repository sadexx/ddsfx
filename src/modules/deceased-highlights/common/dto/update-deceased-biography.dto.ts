import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern } from 'src/common/validators';

export class UpdateDeceasedBiographyDto {
  description: string;

  static readonly schema = Type.Object({ description: ExtendedStringPattern }, { additionalProperties: false });
}

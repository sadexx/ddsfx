import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern } from 'src/common/validators';

export class CreateDeceasedBiographyDto {
  description: string;

  static readonly schema = Type.Object({ description: ExtendedStringPattern }, { additionalProperties: false });
}

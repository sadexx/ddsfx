import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';

export class CreateDeceasedBiographyDto {
  description: string;

  static readonly schema = Type.Object({
    description: StandardStringPattern,
  });
}

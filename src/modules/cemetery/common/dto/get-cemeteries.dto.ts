import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';

export class GetCemeteriesDto {
  searchField: string;

  static readonly schema = Type.Object({ searchField: StandardStringPattern }, { additionalProperties: false });
}

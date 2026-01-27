import { Type } from '@sinclair/typebox';
import { UUIDPattern } from 'src/common/validators';

export class CreateDeceasedMediaContentDto {
  id: string;

  static readonly schema = Type.Object({ id: UUIDPattern }, { additionalProperties: false });
}

import { Type } from '@sinclair/typebox';
import { UUIDPattern } from 'src/common/validators';

export class UUIDParamDto {
  id: string;

  static readonly schema = Type.Object({ id: UUIDPattern }, { additionalProperties: false });
}

export class OptionalUUIDParamDto {
  id?: string;

  static readonly schema = Type.Object({ id: Type.Optional(UUIDPattern) }, { additionalProperties: false });
}

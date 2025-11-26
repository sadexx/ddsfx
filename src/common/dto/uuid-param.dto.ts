import { Type } from '@sinclair/typebox';

export class UUIDParamDto {
  id: string;

  static readonly schema = Type.Object({
    id: Type.String({ format: 'uuid', minLength: 36, maxLength: 36 }),
  });
}

export class OptionalUUIDParamDto {
  id?: string;

  static readonly schema = Type.Object({
    id: Type.Optional(Type.String({ format: 'uuid', minLength: 36, maxLength: 36 })),
  });
}

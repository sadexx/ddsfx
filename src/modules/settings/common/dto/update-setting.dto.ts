import { Type } from '@sinclair/typebox';

export class UpdateSettingDto {
  description?: string;

  static readonly schema = Type.Object(
    {
      description: Type.Optional(Type.String({ minLength: 1, maxLength: 50 })),
    },
    { additionalProperties: false },
  );
}

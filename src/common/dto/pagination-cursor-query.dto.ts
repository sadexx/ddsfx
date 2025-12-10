import { Type } from '@sinclair/typebox';

export class PaginationCursorQueryDto {
  limit: number;
  cursor?: Date;

  static readonly schema = Type.Object(
    {
      limit: Type.Integer({ minimum: 1, maximum: 100, default: 10 }),
      cursor: Type.Optional(Type.String({ format: 'date-time' })),
    },
    { additionalProperties: false },
  );
}

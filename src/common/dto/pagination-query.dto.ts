import { Type } from '@sinclair/typebox';
import { ESortOrder } from 'src/common/enums';

export class PaginationQueryDto {
  limit: number;
  offset: number;
  sortOrder?: ESortOrder;

  static readonly schema = Type.Object({
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 10 })),
    offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
    sortOrder: Type.Optional(Type.String({ enum: Object.values(ESortOrder) })),
  });
}

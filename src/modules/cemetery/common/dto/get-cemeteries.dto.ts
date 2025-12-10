import { Type } from '@sinclair/typebox';
import { PaginationQueryDto } from 'src/common/dto';
import { StandardStringPattern } from 'src/common/validators';

export class GetCemeteriesDto extends PaginationQueryDto {
  searchField?: string;

  static override readonly schema = Type.Composite([
    PaginationQueryDto.schema,
    Type.Object(
      {
        searchField: Type.Optional(StandardStringPattern),
      },
      { additionalProperties: false },
    ),
  ]);
}

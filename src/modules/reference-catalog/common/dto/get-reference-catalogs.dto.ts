import { Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';
import { EReferenceCatalogType } from 'src/modules/reference-catalog/common/enums';

export class GetReferenceCatalogsDto {
  type: EReferenceCatalogType;
  searchField: string;

  static readonly schema = Type.Object(
    {
      type: Type.Enum(EReferenceCatalogType),
      searchField: StandardStringPattern,
    },
    { additionalProperties: false },
  );
}

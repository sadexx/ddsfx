import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';
import { EReferenceCatalogType } from 'src/modules/reference-catalog/common/enums';

export class CreateReferenceCatalogDto {
  type: EReferenceCatalogType;
  value: string;
  fileId?: string;

  static readonly schema = Type.Object(
    {
      type: Type.Enum(EReferenceCatalogType),
      value: StandardStringPattern,
      fileId: Type.Optional(UUIDPattern),
    },
    { additionalProperties: false },
  );
}

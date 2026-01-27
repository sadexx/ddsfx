import { Type } from '@sinclair/typebox';
import { EStaticPageType } from 'src/modules/informational-pages/common/enums';

export class StaticPageParamDto {
  type: EStaticPageType;

  static readonly schema = Type.Object({ type: Type.Enum(EStaticPageType) }, { additionalProperties: false });
}

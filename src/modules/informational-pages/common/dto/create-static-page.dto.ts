import { Type } from '@sinclair/typebox';
import { ExtendedStringPattern } from 'src/common/validators';
import { EStaticPageType } from 'src/modules/informational-pages/common/enums';

export class CreateStaticPageDto {
  type: EStaticPageType;
  content: string;

  static readonly schema = Type.Object(
    { type: Type.Enum(EStaticPageType), content: ExtendedStringPattern },
    { additionalProperties: false },
  );
}

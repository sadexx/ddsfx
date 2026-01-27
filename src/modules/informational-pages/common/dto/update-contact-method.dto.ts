import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UrlPattern } from 'src/common/validators';

export class UpdateContactMethodDto {
  description?: string;
  url?: string;

  static readonly schema = Type.Object(
    { description: Type.Optional(StandardStringPattern), url: Type.Optional(UrlPattern) },
    { additionalProperties: false },
  );
}

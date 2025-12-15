import { Type } from '@sinclair/typebox';
import { UrlPattern } from 'src/common/validators';

export class UpdateDeceasedSocialMediaLinkDto {
  url?: string;

  static readonly schema = Type.Object({
    url: Type.Optional(UrlPattern),
  });
}

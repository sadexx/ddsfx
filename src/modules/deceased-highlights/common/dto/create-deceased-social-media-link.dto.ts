import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { UrlPattern } from 'src/common/validators';
import { EDeceasedSocialMediaLinkPlatform } from 'src/modules/deceased-highlights/common/enums';
import { SOCIAL_MEDIA_LINK_PATTERNS } from 'src/modules/deceased-highlights/common/constants';

export class CreateDeceasedSocialMediaLinkDto {
  platform: EDeceasedSocialMediaLinkPlatform;
  url: string;

  static readonly schema = Type.Object({
    platform: Type.Enum(EDeceasedSocialMediaLinkPlatform),
    url: UrlPattern,
  });

  static validate(data: CreateDeceasedSocialMediaLinkDto): void {
    const pattern = SOCIAL_MEDIA_LINK_PATTERNS[data.platform];

    if (!pattern.test(data.url)) {
      throw new BadRequestException('Invalid social media link');
    }
  }
}

import { EDeceasedSocialMediaLinkPlatform } from 'src/modules/deceased-highlights/common/enums';

export const SOCIAL_MEDIA_LINK_PATTERNS: Record<EDeceasedSocialMediaLinkPlatform, RegExp> = {
  [EDeceasedSocialMediaLinkPlatform.FACEBOOK]:
    /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[A-Za-z0-9._-]+\/?(\?.*)?$/,
  [EDeceasedSocialMediaLinkPlatform.INSTAGRAM]: /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?(\?.*)?$/,
  [EDeceasedSocialMediaLinkPlatform.TWITTER]:
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?(\?.*)?$/,
  [EDeceasedSocialMediaLinkPlatform.LINKEDIN]:
    /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9._-]+\/?(\?.*)?$/,
  [EDeceasedSocialMediaLinkPlatform.TIKTOK]: /^https?:\/\/(www\.)?tiktok\.com\/@[A-Za-z0-9._-]+\/?(\?.*)?$/,
  [EDeceasedSocialMediaLinkPlatform.WIKIPEDIA]: /^https?:\/\/([a-z]{2,3}\.)?wikipedia\.org\/wiki\/[\w%()\-.]+\/?$/,
};

import { EDeceasedSocialMediaLinkPlatform } from 'src/modules/deceased-highlights/common/enums';

export const SOCIAL_MEDIA_LINK_PATTERNS: Record<EDeceasedSocialMediaLinkPlatform, RegExp> = {
  [EDeceasedSocialMediaLinkPlatform.FACEBOOK]: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/.+$/i,
  [EDeceasedSocialMediaLinkPlatform.INSTAGRAM]: /^https?:\/\/(www\.)?instagram\.com\/.+$/i,
  [EDeceasedSocialMediaLinkPlatform.TWITTER]: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+$/i,
  [EDeceasedSocialMediaLinkPlatform.LINKEDIN]: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+$/i,
  [EDeceasedSocialMediaLinkPlatform.TIKTOK]: /^https?:\/\/(www\.)?tiktok\.com\/@.+$/i,
  [EDeceasedSocialMediaLinkPlatform.WIKIPEDIA]: /^https?:\/\/(www\.)?wikipedia\.org\/wiki\/.+$/i,
};

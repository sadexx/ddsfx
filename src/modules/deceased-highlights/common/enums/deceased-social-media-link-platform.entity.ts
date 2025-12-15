import { ValuesOf } from 'src/common/types';

export const EDeceasedSocialMediaLinkPlatform = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  WIKIPEDIA: 'wikipedia',
} as const;

export type EDeceasedSocialMediaLinkPlatform = ValuesOf<typeof EDeceasedSocialMediaLinkPlatform>;

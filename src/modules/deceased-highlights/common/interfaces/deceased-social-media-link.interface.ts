import { TCreateDeceasedSocialMediaLink } from 'src/modules/deceased-highlights/common/types';
import { EDeceasedSocialMediaLinkPlatform } from 'src/modules/deceased-highlights/common/enums';

export interface IDeceasedSocialMediaLink {
  deceased: TCreateDeceasedSocialMediaLink;
  platform: EDeceasedSocialMediaLinkPlatform;
  url: string;
}

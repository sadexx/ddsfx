import { StrictOmit } from 'src/common/types';
import { Setting } from 'src/modules/settings/entities';

export const settingsSeedData: StrictOmit<Setting, 'id' | 'creationDate' | 'updatingDate'> = {
  description: 'Default description',
  fastSearchMaxRequestsPerHour: 100,
  mobileFileKey: 'AWS CloudFront URL',
  mobilePreviewFileKey: 'AWS CloudFront URL',
  mobilePortraitFileKey: 'AWS CloudFront URL',
  firstPostFromFreyaId: '00000000-0000-0000-0000-000000000000',
};

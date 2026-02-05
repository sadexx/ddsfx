import { ValuesOf } from 'src/common/types';

/**
 * Enumeration of allowed file types for categorizing uploads.
 *
 * @description
 * Defines the categories of files that can be managed within the system.
 */
export const EFileType = {
  DECEASED_PHOTOS: 'deceased-photos',
  POST_PHOTOS: 'post-photos',
  POST_VIDEOS: 'post-videos',
  POST_TEMPLATES: 'post-templates',
  USER_AVATARS: 'user-avatars',
  CONTACT_US: 'contact-us',
} as const;

export type EFileType = ValuesOf<typeof EFileType>;

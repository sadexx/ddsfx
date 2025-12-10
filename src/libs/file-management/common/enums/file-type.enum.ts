import { ValuesOf } from 'src/common/types';

/**
 * Enumeration of allowed file types for categorizing uploads.
 *
 * @description
 * Defines the categories of files that can be managed within the system.
 */
export const EFileType = {
  DECEASED_PHOTOS: 'deceased-photos',
  DECEASED_VIDEOS: 'deceased-videos',
} as const;

export type EFileType = ValuesOf<typeof EFileType>;

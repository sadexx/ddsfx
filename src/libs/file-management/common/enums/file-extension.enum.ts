import { ValuesOf } from 'src/common/types';

/**
 * Enumeration of allowed file extensions for uploads.
 *
 * @description
 * Whitelist of file extensions that correspond to allowed MIME types.
 * Extensions are stored WITH period (e.g., '.jpg') for direct comparison with `path.extname()` output.
 */
export const EFileExtension = {
  JPEG: '.jpeg',
  JPG: '.jpg',
  PNG: '.png',
  MP4: '.mp4',
} as const;

export type EFileExtension = ValuesOf<typeof EFileExtension>;

import { ValuesOf } from 'src/common/types';

/**
 * Enumeration of allowed file extensions for uploads.
 *
 * @description
 * Whitelist of file extensions that correspond to allowed MIME types.
 * Extensions are stored WITH period (e.g., '.jpg') for direct comparison with `path.extname()` output.
 */
export const EContentType = {
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_WEBP: 'image/webp',
} as const;

export type EContentType = ValuesOf<typeof EContentType>;

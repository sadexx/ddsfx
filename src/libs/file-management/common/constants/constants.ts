/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  NUMBER_BYTES_IN_MEGABYTE,
  NUMBER_OF_MILLISECONDS_IN_MINUTE,
  NUMBER_OF_MINUTES_IN_FIVE_MINUTES,
} from 'src/common/constants';
import { EFileType, EFolderPath } from 'src/libs/file-management/common/enums';

const MAX_ALLOWED_FILES: number = 4;
const IMAGE_FILE_SIZE_LIMIT: number = NUMBER_BYTES_IN_MEGABYTE * 2;
const VIDEO_FILE_SIZE_LIMIT: number = NUMBER_BYTES_IN_MEGABYTE * 10;
const MAX_FILE_SIZE_LIMIT = VIDEO_FILE_SIZE_LIMIT * MAX_ALLOWED_FILES;
const ATTACHMENT_FILE_TIME_LIMIT = NUMBER_OF_MINUTES_IN_FIVE_MINUTES * NUMBER_OF_MILLISECONDS_IN_MINUTE;

/**
 * Mapping of file types to their corresponding folder paths.
 *
 * @description
 * This constant provides a direct mapping between the defined file types
 * and their respective storage folder paths within the system.
 */
export const FOLDER_PATH_MAP: Record<EFileType, string> = {
  [EFileType.DECEASED_PHOTOS]: EFolderPath.DECEASED_PHOTOS,
  [EFileType.POST_PHOTOS]: EFolderPath.POST_PHOTOS,
  [EFileType.POST_VIDEOS]: EFolderPath.POST_VIDEOS,
  [EFileType.USER_AVATARS]: EFolderPath.USER_AVATARS,
  [EFileType.CONTACT_US]: EFolderPath.CONTACT_US,
};

/**
 * File upload configuration constants.
 *
 * @description
 * This constant provides various configuration settings for file uploads,
 * including the maximum file size limit, allowed file count, and file category-specific limits.
 *
 * @property {number} MAX_REQUEST_SIZE - The maximum total size allowed for a file upload request.
 * @property {number} MAX_FILES - The maximum number of files allowed in a single upload request.
 * @property {number} IMAGE_SIZE - The maximum size allowed for image files.
 * @property {number} VIDEO_SIZE - The maximum size allowed for video files.
 * @property {number} TIME_LIMIT - The time limit for upload files to be valid for attachments to entities.
 */
export const FILE_CONFIG = {
  MAX_REQUEST_SIZE: MAX_FILE_SIZE_LIMIT,
  MAX_FILES: MAX_ALLOWED_FILES,
  IMAGE_SIZE: IMAGE_FILE_SIZE_LIMIT,
  VIDEO_SIZE: VIDEO_FILE_SIZE_LIMIT,
  TIME_LIMIT: ATTACHMENT_FILE_TIME_LIMIT,
} as const;

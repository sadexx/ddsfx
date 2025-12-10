import { EFileType, EFolderPath } from 'src/libs/file-management/common/enums';

/**
 * Mapping of file types to their corresponding folder paths.
 *
 * @description
 * This constant provides a direct mapping between the defined file types
 * and their respective storage folder paths within the system.
 */
export const FOLDER_PATH_MAP: Record<EFileType, string> = {
  [EFileType.DECEASED_PHOTOS]: EFolderPath.DECEASED_PHOTOS,
  [EFileType.DECEASED_VIDEOS]: EFolderPath.DECEASED_VIDEOS,
};

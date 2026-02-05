import { ValuesOf } from 'src/common/types';

export const EDeceasedMediaContentType = {
  DECEASED_AVATAR: 'deceased-avatar',
  DECEASED_GENERAL_PHOTO: 'deceased-general-photo',
  DECEASED_GRAVESTONE_PHOTO: 'deceased-gravestone-photo',
} as const;

export type EDeceasedMediaContentType = ValuesOf<typeof EDeceasedMediaContentType>;

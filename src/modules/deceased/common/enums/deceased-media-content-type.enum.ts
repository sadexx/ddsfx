import { ValuesOf } from 'src/common/types';

export const EDeceasedMediaContentType = {
  MEMORY_PHOTO: 'MEMORY_PHOTO',
  UPLOADED_PHOTO: 'UPLOADED_PHOTO',
} as const;

export type EDeceasedMediaContentType = ValuesOf<typeof EDeceasedMediaContentType>;

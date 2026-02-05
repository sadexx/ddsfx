import { ValuesOf } from 'src/common/types';

export const EPostMediaContentType = {
  POST_MEDIA: 'post-media',
  POST_TEMPLATE: 'post-template',
} as const;

export type EPostMediaContentType = ValuesOf<typeof EPostMediaContentType>;

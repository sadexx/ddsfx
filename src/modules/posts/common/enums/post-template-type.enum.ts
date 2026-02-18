import { ValuesOf } from 'src/common/types';

export const EPostTemplateType = {
  POST_TEMPLATE: 'post-template',
  FREYA_POST_TEMPLATE: 'freya-post-template',
} as const;

export type EPostTemplateType = ValuesOf<typeof EPostTemplateType>;

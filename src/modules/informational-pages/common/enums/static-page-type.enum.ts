import { ValuesOf } from 'src/common/types';

export const EStaticPageType = {
  TERMS_OF_USE: 'terms-of-use',
  PRIVACY_POLICY: 'privacy-policy',
} as const;

export type EStaticPageType = ValuesOf<typeof EStaticPageType>;

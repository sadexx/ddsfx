import { ValuesOf } from 'src/common/types';

export const EReferenceCatalogType = {
  CITY: 'city',
  INSTITUTION_NAME: 'institution-name',
  SPECIALIZATION: 'specialization',
} as const;

export type EReferenceCatalogType = ValuesOf<typeof EReferenceCatalogType>;

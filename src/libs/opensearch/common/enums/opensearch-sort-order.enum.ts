import { ValuesOf } from 'src/common/types';

export const EOpenSearchSortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type EOpenSearchSortOrder = ValuesOf<typeof EOpenSearchSortOrder>;

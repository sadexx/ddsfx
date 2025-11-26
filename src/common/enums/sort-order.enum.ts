import { ValuesOf } from 'src/common/types';

export const ESortOrder = {
  ASC: 'ASC',
  DESC: 'DESC',
  asc: 'asc',
  desc: 'desc',
} as const;

export type ESortOrder = ValuesOf<typeof ESortOrder>;

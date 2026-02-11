import { ValuesOf } from 'src/common/types';

export const EDeceasedPlaceEntryType = {
  RESIDENCE: 'residence',
  SECONDARY_EDUCATION: 'secondary-education',
  HIGHER_EDUCATION: 'higher-education',
} as const;

export type EDeceasedPlaceEntryType = ValuesOf<typeof EDeceasedPlaceEntryType>;

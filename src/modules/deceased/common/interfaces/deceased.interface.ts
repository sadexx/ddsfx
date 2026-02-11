/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { Deceased } from 'src/modules/deceased/entities';

export interface IDeceased extends CreatePayload<
  Deceased,
  | 'graveLocation'
  | 'deceasedSubscriptions'
  | 'deceasedCorrections'
  | 'deceasedBiographies'
  | 'deceasedPlaceEntries'
  | 'deceasedSocialMediaLinks'
  | 'deceasedMediaContents'
  | 'posts'
  | 'memoryCreationDate'
  | 'memoryUpdatingDate'
> {}

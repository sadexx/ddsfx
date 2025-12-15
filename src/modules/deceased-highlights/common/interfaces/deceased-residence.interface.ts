import { TCreateDeceasedResidences, TUpdateDeceasedResidence } from 'src/modules/deceased-highlights/common/types';

export interface IDeceasedResidence {
  city: string;
  isBirthPlace: boolean;
  country: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  deceased: TCreateDeceasedResidences | TUpdateDeceasedResidence;
}

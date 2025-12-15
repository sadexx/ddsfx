import { EDeceasedEducationType } from 'src/modules/deceased-highlights/common/enums';
import { TCreateDeceasedEducations, TUpdateDeceasedEducation } from 'src/modules/deceased-highlights/common/types';

export interface IDeceasedEducation {
  type: EDeceasedEducationType;
  institutionName: string;
  city: string | null;
  country: string | null;
  specialization: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  deceased: TCreateDeceasedEducations | TUpdateDeceasedEducation;
}

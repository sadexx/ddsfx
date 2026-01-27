import { TCreateDeceasedEmployments } from 'src/modules/deceased-highlights/common/types';

export interface IDeceasedEmployment {
  companyName: string;
  position: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  deceased: TCreateDeceasedEmployments;
}

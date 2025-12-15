import { TCreateDeceasedEmployments } from 'src/modules/deceased-highlights/common/types';

export interface IDeceasedEmployment {
  position: string;
  companyName: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  deceased: TCreateDeceasedEmployments;
}

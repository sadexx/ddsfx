import { EDeceasedStatus } from 'src/modules/deceased/common/enums';

export interface IDeceased {
  status: EDeceasedStatus;
  originalId: number | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  deathDay: number | null;
  deathMonth: number | null;
  deathYear: number | null;
  birthDay: number | null;
  birthMonth: number | null;
  birthYear: number | null;
  deathDate: Date | null;
  birthDate: Date | null;
}

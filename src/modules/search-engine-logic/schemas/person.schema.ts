import { EDeceasedStatus } from 'src/modules/deceased/common/enums';

export class PersonSchema {
  id: string;
  originalId: number | null;
  gpsLatitude: number | null;
  gpsAltitude: number | null;
  gpsLongitude: number | null;
  cemeteryName: string | null;
  regionName: string | null;
  regionFullName: string | null;
  status: EDeceasedStatus;
  isFamousPerson: boolean;
  gender: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  fullName: string;
  birthDate: Date | null;
  deathDate: Date | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  fileKey: string | null;
  portraitFileKey: string | null;
  deceasedSubscriptions: DeceasedSubscription[];
  deceasedSubscriptionsCount: number;
}

interface DeceasedSubscription {
  id: string;
  fileKey: string | null;
}

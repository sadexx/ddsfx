export interface IPersonOutput {
  id: string;
  originalId: number;
  gpsLatitude: number;
  gpsAltitude: number;
  gpsLongitude: number;
  cemeteryLabel: string;
  regionLabel: string;
  regionLabelFull: string;
  genderCode: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthDate: Date | null;
  deathDate: Date | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  fileKey: string | null;
  fullName: string;
  score: number | string;
}

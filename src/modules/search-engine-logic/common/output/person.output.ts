export interface IPersonOutput {
  id: string;
  originalId: number | null;
  gpsLatitude: number | null;
  gpsAltitude: number | null;
  gpsLongitude: number | null;
  cemeteryLabel: string | null;
  regionLabel: string | null;
  regionLabelFull: string | null;
  genderCode: string | null;
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

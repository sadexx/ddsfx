export interface IPerson {
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
}

export interface ITransformedPerson {
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
}

export interface IRawPerson {
  file_id: number;
  status_code: string | null | undefined;
  gps_latitude: string | null | undefined;
  gps_altitude: string | null | undefined;
  gps_longitude: string | null | undefined;
  cemetery_label: string | null | undefined;
  region_label: string | null | undefined;
  region_label_full: string | null | undefined;
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  middle_name: string | null | undefined;
  gender_code: string | null | undefined;
  birth_date: string | null | undefined;
  death_date: string | null | undefined;
  birth_year: string | null | undefined;
  birth_month: string | null | undefined;
  birth_day: string | null | undefined;
  death_year: string | null | undefined;
  death_month: string | null | undefined;
  death_day: string | null | undefined;
  file_key: string | null | undefined;
}

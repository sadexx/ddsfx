export interface ITransformedPerson {
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
  deceasedSubscriptions: ITransformedDeceasedSubscription[];
}

export interface ITransformedDeceasedSubscription {
  id: string;
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

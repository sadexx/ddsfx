import { EUserGender } from 'src/modules/users/common/enum';

export interface ITransformedMemoryDataset {
  originalId: number | null;
  gpsLatitude: number | null;
  gpsAltitude: number | null;
  gpsLongitude: number | null;
  cemeteryName: string | null;
  regionName: string | null;
  regionFullName: string | null;
  gender: EUserGender;
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
  filePreviewFileKey: string | null;
  additionalFilePreviewFileKey: string | null;
  portraitFileKey: string | null;
  memoryCreationDate: Date | null;
  memoryUpdatingDate: Date | null;
}

export interface IRawMemoryDataset {
  file_id: number;
  grave_object_id: number;
  created_at: string | null | undefined;
  updated_at: string | null | undefined;
  status_code: string | null | undefined;
  gps_latitude: string | null | undefined;
  gps_altitude: string | null | undefined;
  gps_longitude: string | null | undefined;
  file_preview_file_key: string | null | undefined;
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
  additional_file_preview_file_key: string | null | undefined;
  portrait_file_key: string | null | undefined;
}

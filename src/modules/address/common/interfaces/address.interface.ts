import { Cemetery } from 'src/modules/cemetery/entities';

export interface IAddress {
  cemetery: Cemetery | null;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  city: string;
  streetName: string | null;
  streetNumber: string | null;
  postcode: string | null;
  building: string | null;
  unit: string | null;
  organizationName: string | null;
  timezone: string | null;
}

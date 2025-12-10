import { EntitySchema } from 'typeorm';
import { Cemetery } from 'src/modules/cemetery/entities';

export interface Address {
  id: string;
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
  creationDate: Date;
  updatingDate: Date;
}

export const Address = new EntitySchema<Address>({
  name: 'Address',
  tableName: 'addresses',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_addresses',
      default: (): string => 'uuidv7()',
    },
    latitude: {
      type: 'double precision',
      name: 'latitude',
    },
    longitude: {
      type: 'double precision',
      name: 'longitude',
    },
    country: {
      type: 'varchar',
      name: 'country',
    },
    region: {
      type: 'varchar',
      name: 'region',
    },
    city: {
      type: 'varchar',
      name: 'city',
    },
    streetName: {
      type: 'varchar',
      name: 'street_name',
      nullable: true,
    },
    streetNumber: {
      type: 'varchar',
      name: 'street_number',
      nullable: true,
    },
    postcode: {
      type: 'varchar',
      name: 'postcode',
      nullable: true,
    },
    building: {
      type: 'varchar',
      name: 'building',
      nullable: true,
    },
    unit: {
      type: 'varchar',
      name: 'unit',
      nullable: true,
    },
    organizationName: {
      type: 'varchar',
      name: 'organization_name',
      nullable: true,
    },
    timezone: {
      type: 'varchar',
      name: 'timezone',
      nullable: true,
    },
    creationDate: {
      type: 'timestamptz',
      name: 'creation_date',
      createDate: true,
    },
    updatingDate: {
      type: 'timestamptz',
      name: 'updating_date',
      updateDate: true,
    },
  },
  relations: {
    cemetery: {
      type: 'one-to-one',
      target: 'Cemetery',
      joinColumn: {
        name: 'cemetery_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_addresses_cemeteries',
      },
      onDelete: 'CASCADE',
    },
  },
});

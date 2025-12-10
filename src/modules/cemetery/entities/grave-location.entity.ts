import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { Cemetery } from 'src/modules/cemetery/entities';

export interface GraveLocation {
  id: string;
  cemetery: Cemetery;
  deceased: Deceased;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  creationDate: Date;
  updatingDate: Date;
}

export const GraveLocation = new EntitySchema<GraveLocation>({
  name: 'GraveLocation',
  tableName: 'grave_locations',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_grave_locations',
      default: (): string => 'uuidv7()',
    },
    latitude: {
      type: 'double precision',
      name: 'latitude',
      nullable: true,
    },
    longitude: {
      type: 'double precision',
      name: 'longitude',
      nullable: true,
    },
    altitude: {
      type: 'double precision',
      name: 'altitude',
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
      type: 'many-to-one',
      target: 'Cemetery',
      joinColumn: {
        name: 'cemetery_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_grave_locations_cemeteries',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    deceased: {
      type: 'one-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_grave_locations_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

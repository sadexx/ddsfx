import { EntitySchema } from 'typeorm';
import { Address } from 'src/modules/address/entities';
import { GraveLocation } from 'src/modules/cemetery/entities';

export interface Cemetery {
  id: string;
  address: Address | null;
  graveLocations: GraveLocation[];
  name: string;
  creationDate: Date;
  updatingDate: Date;
}

export const Cemetery = new EntitySchema<Cemetery>({
  name: 'Cemetery',
  tableName: 'cemeteries',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_cemeteries',
      default: (): string => 'uuidv7()',
    },
    name: {
      type: 'varchar',
      name: 'name',
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
    address: {
      type: 'one-to-one',
      target: 'Address',
      inverseSide: 'cemetery',
      cascade: ['insert', 'update'],
    },
    graveLocations: {
      type: 'one-to-many',
      target: 'GraveLocation',
      inverseSide: 'cemetery',
    },
  },
});

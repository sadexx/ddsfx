import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';

export interface DeceasedResidence {
  id: string;
  deceased: Deceased;
  city: string;
  isBirthPlace: boolean;
  country: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedResidence = new EntitySchema<DeceasedResidence>({
  name: 'DeceasedResidence',
  tableName: 'deceased_residences',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_residences',
      default: (): string => 'uuidv7()',
    },
    city: {
      type: 'varchar',
      name: 'city',
    },
    isBirthPlace: {
      type: 'boolean',
      name: 'is_birth_place',
      default: false,
    },
    country: {
      type: 'varchar',
      name: 'country',
      nullable: true,
    },
    description: {
      type: 'varchar',
      name: 'description',
      nullable: true,
    },
    startYear: {
      type: 'integer',
      name: 'start_year',
      nullable: true,
    },
    endYear: {
      type: 'integer',
      name: 'end_year',
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
    deceased: {
      type: 'many-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_residences_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

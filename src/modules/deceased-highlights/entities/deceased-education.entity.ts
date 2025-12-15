import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { EDeceasedEducationType } from 'src/modules/deceased-highlights/common/enums';

export interface DeceasedEducation {
  id: string;
  deceased: Deceased;
  type: EDeceasedEducationType;
  institutionName: string;
  city: string | null;
  country: string | null;
  specialization: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedEducation = new EntitySchema<DeceasedEducation>({
  name: 'DeceasedEducation',
  tableName: 'deceased_educations',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_educations',
      default: (): string => 'uuidv7()',
    },
    type: {
      type: 'enum',
      name: 'type',
      enum: EDeceasedEducationType,
    },
    institutionName: {
      type: 'varchar',
      name: 'institution_name',
    },
    city: {
      type: 'varchar',
      name: 'city',
      nullable: true,
    },
    country: {
      type: 'varchar',
      name: 'country',
      nullable: true,
    },
    specialization: {
      type: 'varchar',
      name: 'specialization',
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
        foreignKeyConstraintName: 'FK_deceased_educations_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

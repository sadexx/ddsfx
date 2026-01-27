import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';

export interface DeceasedEmployment {
  id: string;
  deceased: Deceased;
  companyName: string;
  position: string | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedEmployment = new EntitySchema<DeceasedEmployment>({
  name: 'DeceasedEmployment',
  tableName: 'deceased_employments',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_employments',
      default: (): string => 'uuidv7()',
    },
    companyName: {
      type: 'varchar',
      name: 'company_name',
    },
    position: {
      type: 'varchar',
      name: 'position',
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
        foreignKeyConstraintName: 'FK_deceased_employments_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

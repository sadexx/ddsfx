import { Deceased } from 'src/modules/deceased/entities';
import { User } from 'src/modules/users/entities';
import { EntitySchema } from 'typeorm';

export interface DeceasedCorrection {
  id: string;
  user: User;
  deceased: Deceased;
  genderCode: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  comment: string | null;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedCorrection = new EntitySchema<DeceasedCorrection>({
  name: 'DeceasedCorrection',
  tableName: 'deceased_corrections',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_corrections',
      default: (): string => 'uuidv7()',
    },
    genderCode: {
      type: 'varchar',
      name: 'gender_code',
      nullable: true,
    },
    firstName: {
      type: 'varchar',
      name: 'first_name',
      nullable: true,
    },
    lastName: {
      type: 'varchar',
      name: 'last_name',
      nullable: true,
    },
    middleName: {
      type: 'varchar',
      name: 'middle_name',
      nullable: true,
    },
    birthYear: {
      type: 'int',
      name: 'birth_year',
      nullable: true,
    },
    birthMonth: {
      type: 'int',
      name: 'birth_month',
      nullable: true,
    },
    birthDay: {
      type: 'int',
      name: 'birth_day',
      nullable: true,
    },
    deathYear: {
      type: 'int',
      name: 'death_year',
      nullable: true,
    },
    deathMonth: {
      type: 'int',
      name: 'death_month',
      nullable: true,
    },
    deathDay: {
      type: 'int',
      name: 'death_day',
      nullable: true,
    },
    comment: {
      type: 'text',
      name: 'comment',
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_corrections_users',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    deceased: {
      type: 'many-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_corrections_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

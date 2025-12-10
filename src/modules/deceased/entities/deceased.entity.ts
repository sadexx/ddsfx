import { EntitySchema } from 'typeorm';
import { GraveLocation } from 'src/modules/cemetery/entities';
import { EDeceasedStatus } from 'src/modules/deceased/common/enums';
import { DeceasedSubscription } from 'src/modules/deceased/entities';

export interface Deceased {
  id: string;
  graveLocation: GraveLocation | null;
  deceasedSubscriptions: DeceasedSubscription[];
  status: EDeceasedStatus;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  biography: string | null;
  deathDay: number | null;
  deathMonth: number | null;
  deathYear: number | null;
  deathDate: Date | null;
  birthDay: number | null;
  birthMonth: number | null;
  birthYear: number | null;
  birthDate: Date | null;
  creationDate: Date;
  updatingDate: Date;
}

export const Deceased = new EntitySchema<Deceased>({
  name: 'Deceased',
  tableName: 'deceased',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased',
      default: (): string => 'uuidv7()',
    },
    status: {
      type: 'enum',
      name: 'status',
      enum: EDeceasedStatus,
      default: EDeceasedStatus.PENDING,
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
    biography: {
      type: 'text',
      name: 'biography',
      nullable: true,
    },
    deathDay: {
      type: 'integer',
      name: 'death_day',
      nullable: true,
    },
    deathMonth: {
      type: 'integer',
      name: 'death_month',
      nullable: true,
    },
    deathYear: {
      type: 'integer',
      name: 'death_year',
      nullable: true,
    },
    deathDate: {
      type: 'date',
      name: 'death_date',
      nullable: true,
    },
    birthDay: {
      type: 'integer',
      name: 'birth_day',
      nullable: true,
    },
    birthMonth: {
      type: 'integer',
      name: 'birth_month',
      nullable: true,
    },
    birthYear: {
      type: 'integer',
      name: 'birth_year',
      nullable: true,
    },
    birthDate: {
      type: 'date',
      name: 'birth_date',
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
    graveLocation: {
      type: 'one-to-one',
      target: 'GraveLocation',
      inverseSide: 'deceased',
    },
    deceasedSubscriptions: {
      type: 'one-to-many',
      target: 'DeceasedSubscription',
      inverseSide: 'deceased',
    },
  },
});

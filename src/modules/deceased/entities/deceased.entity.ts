import { EntitySchema } from 'typeorm';
import { GraveLocation } from 'src/modules/cemetery/entities';
import { EDeceasedStatus } from 'src/modules/deceased/common/enums';
import { DeceasedSubscription } from 'src/modules/deceased/entities';
import { DeceasedCorrection } from 'src/modules/deceased-correction/entities';
import {
  DeceasedBiography,
  DeceasedEducation,
  DeceasedEmployment,
  DeceasedHobby,
  DeceasedResidence,
  DeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/entities';

export interface Deceased {
  id: string;
  graveLocation: GraveLocation | null;
  deceasedSubscriptions: DeceasedSubscription[];
  deceasedCorrections: DeceasedCorrection[];
  deceasedBiographies: DeceasedBiography[];
  deceasedEducations: DeceasedEducation[];
  deceasedEmployments: DeceasedEmployment[];
  deceasedHobbies: DeceasedHobby[];
  deceasedResidences: DeceasedResidence[];
  deceasedSocialMediaLinks: DeceasedSocialMediaLink[];
  status: EDeceasedStatus;
  originalId: number | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
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
    },
    originalId: {
      type: 'integer',
      name: 'original_id',
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
    deceasedCorrections: {
      type: 'one-to-many',
      target: 'DeceasedCorrection',
      inverseSide: 'deceased',
    },
    deceasedBiographies: {
      type: 'one-to-many',
      target: 'DeceasedBiography',
      inverseSide: 'deceased',
    },
    deceasedEducations: {
      type: 'one-to-many',
      target: 'DeceasedEducation',
      inverseSide: 'deceased',
    },
    deceasedEmployments: {
      type: 'one-to-many',
      target: 'DeceasedEmployment',
      inverseSide: 'deceased',
    },
    deceasedHobbies: {
      type: 'one-to-many',
      target: 'DeceasedHobby',
      inverseSide: 'deceased',
    },
    deceasedResidences: {
      type: 'one-to-many',
      target: 'DeceasedResidence',
      inverseSide: 'deceased',
    },
    deceasedSocialMediaLinks: {
      type: 'one-to-many',
      target: 'DeceasedSocialMediaLink',
      inverseSide: 'deceased',
    },
  },
});

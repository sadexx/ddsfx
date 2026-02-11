import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';
import { User } from 'src/modules/users/entities';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

export interface DeceasedPlaceEntry {
  id: string;
  deceased: Deceased;
  user: User | null;
  city: ReferenceCatalog | null;
  institutionName: ReferenceCatalog | null;
  specialization: ReferenceCatalog | null;
  type: EDeceasedPlaceEntryType;
  isBirthPlace: boolean | null;
  description: string | null;
  startYear: number | null;
  endYear: number | null;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedPlaceEntry = new EntitySchema<DeceasedPlaceEntry>({
  name: 'DeceasedPlaceEntry',
  tableName: 'deceased_place_entries',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_place_entries',
      default: (): string => 'uuidv7()',
    },
    type: {
      type: 'enum',
      name: 'type',
      enum: EDeceasedPlaceEntryType,
    },
    isBirthPlace: {
      type: 'boolean',
      name: 'is_birth_place',
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
        foreignKeyConstraintName: 'FK_deceased_place_entries_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_place_entries_user',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    city: {
      type: 'many-to-one',
      target: 'ReferenceCatalog',
      joinColumn: {
        name: 'city_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_place_entries_reference_catalogs_city',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    institutionName: {
      type: 'many-to-one',
      target: 'ReferenceCatalog',
      joinColumn: {
        name: 'institution_name_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_place_entries_reference_catalogs_institution_name',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    specialization: {
      type: 'many-to-one',
      target: 'ReferenceCatalog',
      joinColumn: {
        name: 'specialization_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_place_entries_reference_catalogs_specialization',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});

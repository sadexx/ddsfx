import { EntitySchema } from 'typeorm';
import { EReferenceCatalogType } from 'src/modules/reference-catalog/common/enums';
import { File } from 'src/libs/file-management/entities';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';

export interface ReferenceCatalog {
  id: string;
  file: File | null;
  cities: DeceasedPlaceEntry[];
  institutions: DeceasedPlaceEntry[];
  specializations: DeceasedPlaceEntry[];
  type: EReferenceCatalogType;
  value: string;
  isVerify: boolean;
  isArchive: boolean;
  creationDate: Date;
  updatingDate: Date;
}

export const ReferenceCatalog = new EntitySchema<ReferenceCatalog>({
  name: 'ReferenceCatalog',
  tableName: 'reference_catalogs',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_reference_catalogs',
      default: (): string => 'uuidv7()',
    },
    type: {
      type: 'enum',
      name: 'type',
      enum: EReferenceCatalogType,
    },
    value: {
      type: 'varchar',
      name: 'value',
    },
    isVerify: {
      type: 'boolean',
      name: 'is_verify',
      default: false,
    },
    isArchive: {
      type: 'boolean',
      name: 'is_archive',
      default: false,
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
    file: {
      type: 'one-to-one',
      target: 'File',
      joinColumn: {
        name: 'file_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_reference_catalogs_files',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    cities: {
      type: 'one-to-many',
      target: 'DeceasedPlaceEntry',
      inverseSide: 'city',
    },
    institutions: {
      type: 'one-to-many',
      target: 'DeceasedPlaceEntry',
      inverseSide: 'institutionName',
    },
    specializations: {
      type: 'one-to-many',
      target: 'DeceasedPlaceEntry',
      inverseSide: 'specialization',
    },
  },
});

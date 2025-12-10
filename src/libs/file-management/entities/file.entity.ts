import { EntitySchema } from 'typeorm';
import { EContentType, EFileExtension, EFileType } from 'src/libs/file-management/common/enums';
import { BucketLocationConstraint, StorageClass } from '@aws-sdk/client-s3';

export interface File {
  id: string;
  storageType: string;
  storageClass: StorageClass;
  storageRegion: BucketLocationConstraint;
  category: EFileType;
  originalName: string;
  originalFullName: string;
  storageKey: string;
  storagePath: string;
  fileKey: string;
  size: number;
  mimetype: EContentType;
  extension: EFileExtension;
  creationDate: Date;
  updatingDate: Date;
}

export const File = new EntitySchema<File>({
  name: 'File',
  tableName: 'files',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_files',
      default: (): string => 'uuidv7()',
    },
    storageType: {
      type: 'varchar',
      name: 'storage_type',
    },
    storageClass: {
      type: 'varchar',
      name: 'storage_class',
    },
    storageRegion: {
      type: 'varchar',
      name: 'storage_region',
    },
    category: {
      type: 'enum',
      name: 'category',
      enum: EFileType,
    },
    originalName: {
      type: 'varchar',
      name: 'original_name',
    },
    originalFullName: {
      type: 'varchar',
      name: 'original_full_name',
    },
    storageKey: {
      type: 'varchar',
      name: 'storage_key',
    },
    storagePath: {
      type: 'varchar',
      name: 'storage_path',
    },
    fileKey: {
      type: 'varchar',
      name: 'file_key',
      unique: true,
    },
    size: {
      type: 'integer',
      name: 'size',
    },
    mimetype: {
      type: 'enum',
      name: 'mimetype',
      enum: EContentType,
    },
    extension: {
      type: 'enum',
      name: 'extension',
      enum: EFileExtension,
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
});

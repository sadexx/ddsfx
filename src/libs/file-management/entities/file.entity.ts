import { EntitySchema } from 'typeorm';
import { EBucketName, EContentType, EFileExtension, EFileType } from 'src/libs/file-management/common/enums';
import { BucketLocationConstraint, StorageClass } from '@aws-sdk/client-s3';
import { PostMediaContent, PostTemplate } from 'src/modules/posts/entities';
import { DeceasedMediaContent } from 'src/modules/deceased/entities';
import { UserAvatar } from 'src/modules/users/entities';
import { ContactMethod } from 'src/modules/informational-pages/entities';

export interface File {
  id: string;
  postMediaContent: PostMediaContent | null;
  deceasedMediaContent: DeceasedMediaContent | null;
  userAvatar: UserAvatar | null;
  contactMethod: ContactMethod | null;
  postTemplate: PostTemplate | null;
  uploadedByUserId: string;
  storageType: string;
  storageClass: StorageClass;
  storageRegion: BucketLocationConstraint;
  bucketName: EBucketName;
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
    uploadedByUserId: {
      type: 'uuid',
      name: 'uploaded_by_user_id',
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
    bucketName: {
      type: 'enum',
      name: 'bucket_name',
      enum: EBucketName,
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
  relations: {
    postMediaContent: {
      type: 'one-to-one',
      target: 'PostMediaContent',
      inverseSide: 'file',
    },
    deceasedMediaContent: {
      type: 'one-to-one',
      target: 'DeceasedMediaContent',
      inverseSide: 'file',
    },
    userAvatar: {
      type: 'one-to-one',
      target: 'UserAvatar',
      inverseSide: 'file',
    },
    contactMethod: {
      type: 'one-to-one',
      target: 'ContactMethod',
      inverseSide: 'file',
    },
    postTemplate: {
      type: 'one-to-one',
      target: 'PostTemplate',
      inverseSide: 'file',
    },
  },
});

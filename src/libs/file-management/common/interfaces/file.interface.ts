import { BucketLocationConstraint, StorageClass } from '@aws-sdk/client-s3';

interface IBaseFile {
  originalName: string;
  originalFullName: string;
  storageKey: string;
  storagePath: string;
  fileKey: string;
  size: number;
  mimetype: string;
  extension: string;
}

export interface IFile extends IBaseFile {
  storageType: string;
  storageClass: StorageClass;
  storageRegion: BucketLocationConstraint;
}

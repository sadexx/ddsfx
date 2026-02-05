import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { File } from 'src/libs/file-management/entities';

export const UpdateFileQuery = {
  select: {
    id: true,
    bucketName: true,
    category: true,
    fileKey: true,
    extension: true,
    creationDate: true,
    userAvatar: { id: true, status: true },
  } as const satisfies FindOptionsSelect<File>,
  relations: { userAvatar: true } as const satisfies FindOptionsRelations<File>,
};
export type TUpdateFile = QueryResultType<File, typeof UpdateFileQuery.select>;

export const DeleteFileQuery = {
  select: {
    id: true,
    bucketName: true,
    fileKey: true,
  } as const satisfies FindOptionsSelect<File>,
};
export type TDeleteFile = QueryResultType<File, typeof DeleteFileQuery.select>;

export const CopyFileQuery = {
  select: {
    extension: true,
    fileKey: true,
    storageType: true,
    storageClass: true,
    storageRegion: true,
    size: true,
    mimetype: true,
    bucketName: true,
  } as const satisfies FindOptionsSelect<File>,
};
export type TCopyFile = QueryResultType<File, typeof CopyFileQuery.select>;

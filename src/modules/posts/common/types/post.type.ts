import { QueryResultType } from 'src/common/types';
import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { Post } from 'src/modules/posts/entities';

export const GetPostQuery = {
  select: {
    id: true,
    text: true,
    creationDate: true,
    updatingDate: true,
    user: {
      id: true,
      profile: { firstName: true, middleName: true, lastName: true },
      avatar: { id: true, file: { id: true, fileKey: true } },
    },
    mediaContent: { id: true, contentType: true, order: true, file: { id: true, fileKey: true } },
    replyToPost: {
      id: true,
      text: true,
      user: { id: true, profile: { firstName: true, middleName: true, lastName: true } },
      creationDate: true,
    },
  } as const satisfies FindOptionsSelect<Post>,
  relations: {
    user: { profile: true, avatar: { file: true } },
    mediaContent: { file: true },
    replyToPost: { user: { profile: true } },
  } as const satisfies FindOptionsRelations<Post>,
};
export type TGetPost = QueryResultType<Post, typeof GetPostQuery.select>;

export const UpdatePostQuery = {
  select: {
    id: true,
    creationDate: true,
    mediaContent: { id: true },
  } as const satisfies FindOptionsSelect<Post>,
  relations: {
    mediaContent: true,
  } as const satisfies FindOptionsRelations<Post>,
};
export type TUpdatePost = QueryResultType<Post, typeof UpdatePostQuery.select>;

export const DeletePostQuery = {
  select: {
    id: true,
    mediaContent: { id: true, file: { id: true, fileKey: true } },
  } as const satisfies FindOptionsSelect<Post>,
  relations: {
    mediaContent: { file: true },
  } as const satisfies FindOptionsRelations<Post>,
};
export type TDeletePost = QueryResultType<Post, typeof DeletePostQuery.select>;

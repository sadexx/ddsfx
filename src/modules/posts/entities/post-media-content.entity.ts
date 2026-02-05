import { EntitySchema } from 'typeorm';
import { Post } from 'src/modules/posts/entities/post.entity';
import { File } from 'src/libs/file-management/entities';
import { EPostMediaContentType } from 'src/modules/posts/common/enums';

export interface PostMediaContent {
  id: string;
  post: Post;
  file: File;
  contentType: EPostMediaContentType;
  order: number;
  creationDate: Date;
  updatingDate: Date;
}

export const PostMediaContent = new EntitySchema<PostMediaContent>({
  name: 'PostMediaContent',
  tableName: 'post_media_contents',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_post_media_contents',
      default: (): string => 'uuidv7()',
    },
    contentType: {
      type: 'enum',
      name: 'content_type',
      enum: EPostMediaContentType,
    },
    order: {
      type: 'integer',
      name: 'order',
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
    post: {
      type: 'many-to-one',
      target: 'Post',
      joinColumn: {
        name: 'post_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_post_media_contents_posts',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    file: {
      type: 'one-to-one',
      target: 'File',
      joinColumn: {
        name: 'file_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_post_media_contents_files',
      },
      nullable: true,
      onDelete: 'CASCADE',
    },
  },
});

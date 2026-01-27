import { EntitySchema } from 'typeorm';
import { User } from 'src/modules/users/entities';
import { Deceased } from 'src/modules/deceased/entities';
import { PostMediaContent } from 'src/modules/posts/entities/post-media-content.entity';

export interface Post {
  id: string;
  user: User | null;
  deceased: Deceased;
  mediaContent: PostMediaContent[];
  replyToPost: Post | null;
  text: string | null;
  creationDate: Date;
  updatingDate: Date;
}

export const Post = new EntitySchema<Post>({
  name: 'Post',
  tableName: 'posts',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_posts',
      default: (): string => 'uuidv7()',
    },
    text: {
      type: 'text',
      name: 'text',
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_posts_users',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
    deceased: {
      type: 'many-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_posts_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    mediaContent: {
      type: 'one-to-many',
      target: 'PostMediaContent',
      inverseSide: 'post',
    },
    replyToPost: {
      type: 'many-to-one',
      target: 'Post',
      joinColumn: {
        name: 'reply_to_post_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_posts_reply_to_post',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});

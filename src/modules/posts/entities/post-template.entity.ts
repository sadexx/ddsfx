import { EntitySchema } from 'typeorm';
import { File } from 'src/libs/file-management/entities';
import { EPostTemplateType } from 'src/modules/posts/common/enums';

export interface PostTemplate {
  id: string;
  file: File;
  postType: EPostTemplateType;
  isActive: boolean;
  text: string | null;
  creationDate: Date;
  updatingDate: Date;
}

export const PostTemplate = new EntitySchema<PostTemplate>({
  name: 'PostTemplate',
  tableName: 'post_templates',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_post_templates',
      default: (): string => 'uuidv7()',
    },
    postType: {
      type: 'enum',
      name: 'post_type',
      enum: EPostTemplateType,
    },
    isActive: {
      type: 'boolean',
      name: 'is_active',
      default: true,
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
    file: {
      type: 'one-to-one',
      target: 'File',
      joinColumn: {
        name: 'file_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_post_templates_files',
      },
      nullable: true,
      onDelete: 'CASCADE',
    },
  },
});

import { EntitySchema } from 'typeorm';
import { File } from 'src/libs/file-management/entities';

export interface PostTemplate {
  id: string;
  file: File;
  isActive: boolean;
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
    isActive: {
      type: 'boolean',
      name: 'is_active',
      default: true,
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

import { EntitySchema } from 'typeorm';
import { File } from 'src/libs/file-management/entities';

export interface ContactMethod {
  id: string;
  file: File;
  description: string;
  url: string;
  creationDate: Date;
  updatingDate: Date;
}

export const ContactMethod = new EntitySchema<ContactMethod>({
  name: 'ContactMethod',
  tableName: 'contact_methods',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_contact_methods',
      default: (): string => 'uuidv7()',
    },
    description: {
      type: 'varchar',
      name: 'description',
    },
    url: {
      type: 'varchar',
      name: 'url',
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
        foreignKeyConstraintName: 'FK_contact_methods_files',
      },
      nullable: false,
    },
  },
});

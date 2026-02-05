import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { EDeceasedMediaContentType } from 'src/modules/deceased/common/enums';
import { File } from 'src/libs/file-management/entities';

export interface DeceasedMediaContent {
  id: string;
  deceased: Deceased;
  file: File;
  contentType: EDeceasedMediaContentType;
  order: number;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedMediaContent = new EntitySchema<DeceasedMediaContent>({
  name: 'DeceasedMediaContent',
  tableName: 'deceased_media_contents',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_media_contents',
      default: (): string => 'uuidv7()',
    },
    contentType: {
      type: 'enum',
      name: 'content_type',
      enum: EDeceasedMediaContentType,
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
    deceased: {
      type: 'many-to-one',
      target: 'Deceased',
      joinColumn: {
        name: 'deceased_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_media_contents_deceased',
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
        foreignKeyConstraintName: 'FK_deceased_media_contents_files',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

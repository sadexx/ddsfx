import { EntitySchema } from 'typeorm';
import { EStaticPageType } from 'src/modules/informational-pages/common/enums';

export interface StaticPage {
  id: string;
  type: EStaticPageType;
  content: string;
  creationDate: Date;
  updatingDate: Date;
}

export const StaticPage = new EntitySchema<StaticPage>({
  name: 'StaticPage',
  tableName: 'static_pages',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_static_pages',
      default: (): string => 'uuidv7()',
    },
    type: {
      type: 'enum',
      name: 'type',
      enum: EStaticPageType,
      unique: true,
    },
    content: {
      type: 'text',
      name: 'content',
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
});

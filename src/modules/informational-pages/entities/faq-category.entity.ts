import { EntitySchema } from 'typeorm';
import { FaqItem } from 'src/modules/informational-pages/entities';

export interface FaqCategory {
  id: string;
  items: FaqItem[];
  name: string;
  creationDate: Date;
  updatingDate: Date;
}

export const FaqCategory = new EntitySchema<FaqCategory>({
  name: 'FaqCategory',
  tableName: 'faq_categories',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_faq_categories',
      default: (): string => 'uuidv7()',
    },
    name: {
      type: 'varchar',
      name: 'name',
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
    items: {
      type: 'one-to-many',
      target: 'FaqItem',
      inverseSide: 'category',
    },
  },
});

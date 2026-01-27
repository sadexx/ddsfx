import { EntitySchema } from 'typeorm';
import { FaqCategory } from 'src/modules/informational-pages/entities';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  creationDate: Date;
  updatingDate: Date;
}

export const FaqItem = new EntitySchema<FaqItem>({
  name: 'FaqItem',
  tableName: 'faq_items',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_faq_items',
      default: (): string => 'uuidv7()',
    },
    question: {
      type: 'varchar',
      name: 'question',
    },
    answer: {
      type: 'varchar',
      name: 'answer',
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
    category: {
      type: 'many-to-one',
      target: 'FaqCategory',
      joinColumn: {
        name: 'faq_category_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_faq_items_faq_categories',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

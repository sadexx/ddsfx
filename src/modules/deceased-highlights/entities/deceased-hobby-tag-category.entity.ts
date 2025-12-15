import { EntitySchema } from 'typeorm';
import { DeceasedHobbyTag } from 'src/modules/deceased-highlights/entities';

export interface DeceasedHobbyTagCategory {
  id: string;
  deceasedHobbyTags: DeceasedHobbyTag[];
  name: string;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedHobbyTagCategory = new EntitySchema<DeceasedHobbyTagCategory>({
  name: 'DeceasedHobbyTagCategory',
  tableName: 'deceased_hobby_tag_categories',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_hobby_tag_categories',
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
    deceasedHobbyTags: {
      type: 'one-to-many',
      target: 'DeceasedHobbyTag',
      inverseSide: 'deceasedHobbyTagCategory',
    },
  },
});

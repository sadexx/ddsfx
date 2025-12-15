import { EntitySchema } from 'typeorm';
import { DeceasedHobby, DeceasedHobbyTagCategory } from 'src/modules/deceased-highlights/entities';

export interface DeceasedHobbyTag {
  id: string;
  deceasedHobbyTagCategory: DeceasedHobbyTagCategory;
  deceasedHobbies: DeceasedHobby[];
  name: string;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedHobbyTag = new EntitySchema<DeceasedHobbyTag>({
  name: 'DeceasedHobbyTag',
  tableName: 'deceased_hobby_tags',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_hobby_tags',
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
    deceasedHobbyTagCategory: {
      type: 'many-to-one',
      target: 'DeceasedHobbyTagCategory',
      joinColumn: {
        name: 'deceased_hobby_tag_category_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_hobby_tags_deceased_hobby_tag_categories',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    deceasedHobbies: {
      type: 'many-to-many',
      target: 'DeceasedHobby',
      inverseSide: 'deceasedHobbyTags',
    },
  },
});

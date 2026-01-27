import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { DeceasedHobbyTag } from 'src/modules/deceased-highlights/entities';

export interface DeceasedHobby {
  id: string;
  deceased: Deceased;
  deceasedHobbyTags: DeceasedHobbyTag[];
  description: string;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedHobby = new EntitySchema<DeceasedHobby>({
  name: 'DeceasedHobby',
  tableName: 'deceased_hobbies',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_hobbies',
      default: (): string => 'uuidv7()',
    },
    description: {
      type: 'varchar',
      name: 'description',
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
        foreignKeyConstraintName: 'FK_deceased_hobbies_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    deceasedHobbyTags: {
      type: 'many-to-many',
      target: 'DeceasedHobbyTag',
      joinTable: {
        name: 'deceased_hobby_tags_deceased_hobbies',
        joinColumn: {
          name: 'deceased_hobby_id',
          referencedColumnName: 'id',
          foreignKeyConstraintName: 'FK_deceased_hobby_tags_deceased_hobbies',
        },
        inverseJoinColumn: {
          name: 'deceased_hobby_tag_id',
          referencedColumnName: 'id',
          foreignKeyConstraintName: 'FK_deceased_hobbies_deceased_hobby_tags',
        },
      },
      onDelete: 'CASCADE',
    },
  },
});

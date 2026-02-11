import { EntitySchema } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { User } from 'src/modules/users/entities';

export interface DeceasedBiography {
  id: string;
  deceased: Deceased;
  user: User | null;
  description: string;
  creationDate: Date;
  updatingDate: Date;
}

export const DeceasedBiography = new EntitySchema<DeceasedBiography>({
  name: 'DeceasedBiography',
  tableName: 'deceased_biographies',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_deceased_biographies',
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
        foreignKeyConstraintName: 'FK_deceased_biographies_deceased',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_deceased_biographies_user',
      },
      nullable: true,
      onDelete: 'SET NULL',
    },
  },
});

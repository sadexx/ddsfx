import { EntitySchema } from 'typeorm';
import { User } from 'src/modules/users/entities';

export interface UserProfile {
  id: string;
  user: User;
  firstName: string;
  lastName: string;
  middleName: string;
  creationDate: Date;
  updatingDate: Date;
}

export const UserProfile = new EntitySchema<UserProfile>({
  name: 'UserProfile',
  tableName: 'user_profiles',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_user_profiles',
      default: (): string => 'uuidv7()',
    },
    firstName: {
      type: 'varchar',
      name: 'first_name',
    },
    lastName: {
      type: 'varchar',
      name: 'last_name',
    },
    middleName: {
      type: 'varchar',
      name: 'middle_name',
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
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_user_profiles_users',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

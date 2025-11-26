import { Role, User } from 'src/modules/users/entities';
import { EAccountStatus } from 'src/modules/users/common/enum';
import { EntitySchema } from 'typeorm';

export interface UserRole {
  id: string;
  user: User;
  role: Role;
  accountStatus: EAccountStatus;
  creationDate: Date;
  updatingDate: Date;
}

export const UserRole = new EntitySchema<UserRole>({
  name: 'UserRole',
  tableName: 'user_roles',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_user_roles',
      default: (): string => 'uuidv7()',
    },
    accountStatus: {
      type: 'enum',
      name: 'account_status',
      enum: EAccountStatus,
      default: EAccountStatus.ACTIVE,
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
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_user_roles_users',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    role: {
      type: 'many-to-one',
      target: 'Role',
      joinColumn: {
        name: 'role_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_user_roles_roles',
      },
      nullable: false,
    },
  },
});

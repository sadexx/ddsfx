import { UserRole } from 'src/modules/users/entities';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { EntitySchema } from 'typeorm';

export interface Role {
  id: string;
  userRoles: UserRole[];
  roleName: EUserRoleName;
  creationDate: Date;
  updatingDate: Date;
}

export const Role = new EntitySchema<Role>({
  name: 'Role',
  tableName: 'roles',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_roles',
      default: (): string => 'uuidv7()',
    },
    roleName: {
      type: 'enum',
      name: 'role_name',
      enum: EUserRoleName,
      unique: true,
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
    userRoles: {
      type: 'one-to-many',
      target: 'UserRole',
      inverseSide: 'roles',
    },
  },
});

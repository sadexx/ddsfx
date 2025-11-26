import { Session } from 'src/modules/sessions/entities';
import { UserRole } from 'src/modules/users/entities';
import { EntitySchema } from 'typeorm';

export interface User {
  id: string;
  sessions: Session[];
  roles: UserRole[];
  email: string | null;
  isEmailVerified: boolean;
  passwordHash: string | null;
  phoneNumber: string | null;
  isPhoneNumberVerified: boolean;
  creationDate: Date;
  updatingDate: Date;
}

export const User = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_users',
      default: (): string => 'uuidv7()',
    },
    email: {
      type: 'varchar',
      name: 'email',
      nullable: true,
    },
    isEmailVerified: {
      type: 'boolean',
      name: 'is_email_verified',
    },
    passwordHash: {
      type: 'varchar',
      name: 'password_hash',
      nullable: true,
    },
    phoneNumber: {
      type: 'varchar',
      name: 'phone_number',
      nullable: true,
      unique: true,
    },
    isPhoneNumberVerified: {
      type: 'boolean',
      name: 'is_phone_number_verified',
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
    sessions: {
      type: 'one-to-many',
      target: 'Session',
      inverseSide: 'user',
    },
    roles: {
      type: 'one-to-many',
      target: 'UserRole',
      inverseSide: 'user',
    },
  },
});

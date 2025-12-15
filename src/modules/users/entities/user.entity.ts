import { Session } from 'src/modules/sessions/entities';
import { UserProfile, UserRole } from 'src/modules/users/entities';
import { ComplaintForm } from 'src/modules/complaint-form/entities';
import { EntitySchema } from 'typeorm';
import { DeceasedSubscription } from 'src/modules/deceased/entities';
import { DeceasedCorrection } from 'src/modules/deceased-correction/entities';

export interface User {
  id: string;
  sessions: Session[];
  roles: UserRole[];
  profile: UserProfile | null;
  deceasedSubscriptions: DeceasedSubscription[];
  complaintsReported: ComplaintForm[];
  complaintsReceived: ComplaintForm[];
  deceasedCorrections: DeceasedCorrection[];
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
    profile: {
      type: 'one-to-one',
      target: 'UserProfile',
      inverseSide: 'user',
    },
    deceasedSubscriptions: {
      type: 'one-to-many',
      target: 'DeceasedSubscription',
      inverseSide: 'user',
    },
    complaintsReported: {
      type: 'one-to-many',
      target: 'ComplaintForm',
      inverseSide: 'reportedUser',
    },
    complaintsReceived: {
      type: 'one-to-many',
      target: 'ComplaintForm',
      inverseSide: 'subjectUser',
    },
    deceasedCorrections: {
      type: 'one-to-many',
      target: 'DeceasedCorrection',
      inverseSide: 'user',
    },
  },
});

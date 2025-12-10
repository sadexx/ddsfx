import { User } from 'src/modules/users/entities';
import { EAuthProvider } from 'src/modules/auth/common/enums';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { EPlatformType } from 'src/modules/sessions/common/enum';
import { EntitySchema } from 'typeorm';

export interface Session {
  id: string;
  user: User;
  roleName: EUserRoleName;
  authProvider: EAuthProvider;
  refreshToken: string;
  refreshTokenExpirationDate: Date;
  ipAddress: string;
  userAgent: string;
  platform: EPlatformType;
  pushNotificationToken: string | null;
  appVersion: string;
  osVersion: string;
  deviceModel: string;
  clientIp: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  creationDate: Date;
  updatingDate: Date;
}

export const Session = new EntitySchema<Session>({
  name: 'Session',
  tableName: 'sessions',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_sessions',
      default: (): string => 'uuidv7()',
    },
    roleName: {
      type: 'enum',
      name: 'role_name',
      enum: EUserRoleName,
    },
    authProvider: {
      type: 'enum',
      name: 'auth_provider',
      enum: EAuthProvider,
    },
    refreshToken: {
      type: 'varchar',
      name: 'refresh_token',
    },
    refreshTokenExpirationDate: {
      type: 'timestamptz',
      name: 'refresh_token_expiration_date',
    },
    ipAddress: {
      type: 'varchar',
      name: 'ip_address',
    },
    userAgent: {
      type: 'varchar',
      name: 'user_agent',
    },
    platform: {
      type: 'enum',
      name: 'platform',
      enum: EPlatformType,
    },
    pushNotificationToken: {
      type: 'varchar',
      name: 'push_notification_token',
      nullable: true,
    },
    appVersion: {
      type: 'varchar',
      name: 'app_version',
    },
    osVersion: {
      type: 'varchar',
      name: 'os_version',
    },
    deviceModel: {
      type: 'varchar',
      name: 'device_model',
    },
    clientIp: {
      type: 'varchar',
      name: 'client_ip',
    },
    country: {
      type: 'varchar',
      name: 'country',
    },
    city: {
      type: 'varchar',
      name: 'city',
    },
    region: {
      type: 'varchar',
      name: 'region',
    },
    postalCode: {
      type: 'varchar',
      name: 'postal_code',
    },
    latitude: {
      type: 'double precision',
      name: 'latitude',
    },
    longitude: {
      type: 'double precision',
      name: 'longitude',
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
        foreignKeyConstraintName: 'FK_sessions_users',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

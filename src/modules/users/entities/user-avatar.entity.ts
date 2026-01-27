import { EntitySchema } from 'typeorm';
import { File } from 'src/libs/file-management/entities';
import { User } from 'src/modules/users/entities';
import { EUserAvatarStatus } from 'src/modules/users/common/enum';

export interface UserAvatar {
  id: string;
  user: User;
  file: File;
  status: EUserAvatarStatus;
  creationDate: Date;
  updatingDate: Date;
}

export const UserAvatar = new EntitySchema<UserAvatar>({
  name: 'UserAvatar',
  tableName: 'user_avatars',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      name: 'id',
      primaryKeyConstraintName: 'PK_user_avatars',
      default: (): string => 'uuidv7()',
    },
    status: {
      type: 'enum',
      name: 'status',
      enum: EUserAvatarStatus,
      default: EUserAvatarStatus.PENDING,
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
        foreignKeyConstraintName: 'FK_user_avatars_users',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    file: {
      type: 'one-to-one',
      target: 'File',
      joinColumn: {
        name: 'file_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'FK_user_avatars_files',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});

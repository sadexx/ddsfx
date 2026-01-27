import { EUserAvatarStatus } from 'src/modules/users/common/enum';
import { File } from 'src/libs/file-management/entities';
import { User } from 'src/modules/users/entities';

export interface IUserAvatar {
  user: User;
  file: File;
  status: EUserAvatarStatus;
}

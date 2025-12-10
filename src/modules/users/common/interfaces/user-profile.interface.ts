import { TCreateDeceasedProfileUser } from 'src/modules/deceased/common/types';

export interface IUserProfile {
  firstName: string;
  lastName: string;
  middleName: string;
  user: TCreateDeceasedProfileUser;
}

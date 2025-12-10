import { User, UserProfile } from 'src/modules/users/entities';

/**
 ** Types
 */

export type TEnsureUserProfile = Pick<User, 'id'> & {
  profile: Pick<UserProfile, 'id'> | null;
};

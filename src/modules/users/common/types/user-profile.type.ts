import { FindOptionsSelect, FindOptionsRelations } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { User, UserProfile } from 'src/modules/users/entities';

/**
 ** Query types
 */

export const CreateUserProfileQuery = {
  select: {
    id: true,
    profile: { id: true },
  } as const satisfies FindOptionsSelect<User>,
  relations: { profile: true } as const satisfies FindOptionsRelations<User>,
};
export type TCreateUserProfile = QueryResultType<User, typeof CreateUserProfileQuery.select>;

export const UpdateUserProfileQuery = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    middleName: true,
  } as const satisfies FindOptionsSelect<UserProfile>,
};
export type TUpdateUserProfile = QueryResultType<UserProfile, typeof UpdateUserProfileQuery.select>;

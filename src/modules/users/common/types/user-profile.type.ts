import { FindOptionsSelect, FindOptionsRelations } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { User, UserProfile } from 'src/modules/users/entities';

/**
 ** Query types
 */

export const GetUserProfileQuery = {
  select: {
    id: true,
    email: true,
    phoneNumber: true,
    registrationStrategy: true,
    roles: { id: true, accountStatus: true, role: { id: true, roleName: true } },
    profile: { id: true, firstName: true, lastName: true, middleName: true },
    avatar: { id: true, status: true, file: { id: true, fileKey: true } },
  } as const satisfies FindOptionsSelect<User>,
  relations: {
    roles: { role: true },
    profile: true,
    avatar: { file: true },
  } as const satisfies FindOptionsRelations<User>,
};
export type TGetUserProfile = QueryResultType<User, typeof GetUserProfileQuery.select>;

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

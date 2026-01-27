import { FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { User } from 'src/modules/users/entities';

/**
 ** Query types
 */

export const ChangePhoneNumberQuery = {
  select: {
    id: true,
    phoneNumber: true,
  } as const satisfies FindOptionsSelect<User>,
};
export type TChangePhoneNumber = QueryResultType<User, typeof ChangePhoneNumberQuery.select>;

export const ChangeEmailQuery = {
  select: {
    id: true,
    email: true,
    registrationStrategy: true,
  } as const satisfies FindOptionsSelect<User>,
};
export type TChangeEmail = QueryResultType<User, typeof ChangeEmailQuery.select>;

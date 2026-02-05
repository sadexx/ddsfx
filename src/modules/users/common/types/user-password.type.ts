import { FindOptionsSelect } from 'typeorm';
import { User } from 'src/modules/users/entities';
import { NonNullableProperties, QueryResultType } from 'src/common/types';

/**
 ** Query types
 */

export const ResetPasswordQuery = {
  select: {
    id: true,
    email: true,
  } as const satisfies FindOptionsSelect<User>,
};
type TResetPasswordQuery = QueryResultType<User, typeof ResetPasswordQuery.select>;
export type TResetPassword = NonNullableProperties<TResetPasswordQuery, 'email'>;

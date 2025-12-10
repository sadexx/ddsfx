import { QueryResultType } from 'src/common/types';
import { User } from 'src/modules/users/entities';
import { FindOptionsSelect } from 'typeorm';

export const UserForCreateComplaintForm = {
  select: { id: true } as const satisfies FindOptionsSelect<User>,
};
export type TUserForCreateComplaintForm = QueryResultType<User, typeof UserForCreateComplaintForm.select>;

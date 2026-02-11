/* eslint-disable @typescript-eslint/no-empty-object-type */
import { UserAvatar } from 'src/modules/users/entities';
import { CreatePayload } from 'src/common/types';

export interface IUserAvatar extends CreatePayload<UserAvatar> {}

/* eslint-disable @typescript-eslint/no-empty-object-type */
import { UserProfile } from 'src/modules/users/entities';
import { CreatePayload } from 'src/common/types';

export interface IUserProfile extends CreatePayload<UserProfile> {}

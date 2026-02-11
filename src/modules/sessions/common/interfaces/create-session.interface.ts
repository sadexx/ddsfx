/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Session } from 'src/modules/sessions/entities';
import { CreatePayload } from 'src/common/types';

export interface ICreateSession extends CreatePayload<Session, 'user'> {}

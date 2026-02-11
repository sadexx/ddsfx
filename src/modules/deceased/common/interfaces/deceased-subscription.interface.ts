/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { DeceasedSubscription } from 'src/modules/deceased/entities';

export interface IDeceasedSubscription extends CreatePayload<DeceasedSubscription> {}

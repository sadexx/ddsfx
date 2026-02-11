/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { Cemetery } from 'src/modules/cemetery/entities';

export interface ICemetery extends CreatePayload<Cemetery, 'graveLocations'> {}

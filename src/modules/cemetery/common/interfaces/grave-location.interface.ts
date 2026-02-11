/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { GraveLocation } from 'src/modules/cemetery/entities';

export interface IGraveLocation extends CreatePayload<GraveLocation> {}

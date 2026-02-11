/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { DeceasedBiography } from 'src/modules/deceased-highlights/entities';

export interface IDeceasedBiography extends CreatePayload<DeceasedBiography> {}

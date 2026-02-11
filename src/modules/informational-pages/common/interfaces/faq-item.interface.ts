/* eslint-disable @typescript-eslint/no-empty-object-type */
import { FaqItem } from 'src/modules/informational-pages/entities';
import { CreatePayload } from 'src/common/types';

export interface IFaqItem extends CreatePayload<FaqItem> {}

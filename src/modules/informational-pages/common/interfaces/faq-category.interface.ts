/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreatePayload } from 'src/common/types';
import { FaqCategory } from 'src/modules/informational-pages/entities';

export interface IFaqCategory extends CreatePayload<FaqCategory, 'items'> {}

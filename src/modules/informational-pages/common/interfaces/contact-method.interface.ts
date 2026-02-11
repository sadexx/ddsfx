/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ContactMethod } from 'src/modules/informational-pages/entities';
import { CreatePayload } from 'src/common/types';

export interface IContactMethod extends CreatePayload<ContactMethod> {}

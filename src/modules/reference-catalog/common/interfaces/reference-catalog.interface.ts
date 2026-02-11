/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';
import { CreatePayload } from 'src/common/types';

export interface IReferenceCatalog extends CreatePayload<
  ReferenceCatalog,
  'cities' | 'institutions' | 'specializations'
> {}

import { FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

export const GetReferenceCatalogsQuery = {
  select: {
    id: true,
    value: true,
  } as const satisfies FindOptionsSelect<ReferenceCatalog>,
};
export type TGetReferenceCatalogs = QueryResultType<ReferenceCatalog, typeof GetReferenceCatalogsQuery.select>;

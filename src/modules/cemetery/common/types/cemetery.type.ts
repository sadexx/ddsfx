import { FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Cemetery } from 'src/modules/cemetery/entities';

export const GetCemeteriesQuery = {
  select: {
    id: true,
    name: true,
  } as const satisfies FindOptionsSelect<Cemetery>,
};
export type TGetCemeteries = QueryResultType<Cemetery, typeof GetCemeteriesQuery.select>;

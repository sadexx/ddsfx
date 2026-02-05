import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const CreateDeceasedMediaContentQuery = {
  select: {
    id: true,
    status: true,
    deceasedMediaContents: { id: true, contentType: true, file: { id: true } },
  } as const satisfies FindOptionsSelect<Deceased>,
  relations: { deceasedMediaContents: { file: true } } as const satisfies FindOptionsRelations<Deceased>,
};
export type TCreateDeceasedMediaContent = QueryResultType<Deceased, typeof CreateDeceasedMediaContentQuery.select>;

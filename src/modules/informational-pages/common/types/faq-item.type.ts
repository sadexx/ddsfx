import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { FaqItem } from 'src/modules/informational-pages/entities';

/**
 ** Query types
 */

export const UpdateFaqItemQuery = {
  select: {
    id: true,
    question: true,
    answer: true,
    category: { id: true },
  } as const satisfies FindOptionsSelect<FaqItem>,
  relations: { category: true } as const satisfies FindOptionsRelations<FaqItem>,
};
export type TUpdateFaqItem = QueryResultType<FaqItem, typeof UpdateFaqItemQuery.select>;

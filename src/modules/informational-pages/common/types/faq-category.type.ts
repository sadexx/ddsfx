import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { FaqCategory } from 'src/modules/informational-pages/entities';

/**
 ** Query types
 */

export const GetFaqCategoriesQuery = {
  select: {
    id: true,
    name: true,
    items: { id: true, question: true, answer: true },
  } as const satisfies FindOptionsSelect<FaqCategory>,
  relations: { items: true } as const satisfies FindOptionsRelations<FaqCategory>,
};
export type TGetFaqCategories = QueryResultType<FaqCategory, typeof GetFaqCategoriesQuery.select>;

export const UpdateFaqCategoryQuery = {
  select: {
    id: true,
    name: true,
  } as const satisfies FindOptionsSelect<FaqCategory>,
};
export type TUpdateFaqCategory = QueryResultType<FaqCategory, typeof UpdateFaqCategoryQuery.select>;

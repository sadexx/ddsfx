import { FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { StaticPage } from 'src/modules/informational-pages/entities';

/**
 ** Query types
 */

export const GetStaticPageQuery = {
  select: {
    id: true,
    content: true,
  } as const satisfies FindOptionsSelect<StaticPage>,
};
export type TGetStaticPage = QueryResultType<StaticPage, typeof GetStaticPageQuery.select>;

export const UpdateStaticPageQuery = {
  select: {
    id: true,
    content: true,
  } as const satisfies FindOptionsSelect<StaticPage>,
};
export type TUpdateStaticPage = QueryResultType<StaticPage, typeof UpdateStaticPageQuery.select>;

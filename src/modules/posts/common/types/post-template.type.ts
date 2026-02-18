import { FindOptionsSelect, FindOptionsRelations } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { PostTemplate } from 'src/modules/posts/entities';

/**
 ** Query types
 */

export const GetPostTemplatesQuery = {
  select: {
    id: true,
    file: { id: true, fileKey: true },
  } as const satisfies FindOptionsSelect<PostTemplate>,
  relations: { file: true } as const satisfies FindOptionsRelations<PostTemplate>,
};
export type TGetPostTemplates = QueryResultType<PostTemplate, typeof GetPostTemplatesQuery.select>;

export const ApplyPostTemplateQuery = {
  select: {
    id: true,
    file: { id: true },
  } as const satisfies FindOptionsSelect<PostTemplate>,
  relations: { file: true } as const satisfies FindOptionsRelations<PostTemplate>,
};
export type TApplyPostTemplate = QueryResultType<PostTemplate, typeof ApplyPostTemplateQuery.select>;

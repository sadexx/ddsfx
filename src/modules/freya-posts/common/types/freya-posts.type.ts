import { PostTemplate } from 'src/modules/posts/entities';
import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Types
 */
export type TDeceasedNameDetails = Pick<Deceased, 'id' | 'firstName' | 'lastName' | 'middleName'>;

/**
 ** Query types
 */

export const GetFreyaPostTemplateQuery = {
  select: {
    id: true,
    text: true,
    file: { id: true },
  } as const satisfies FindOptionsSelect<PostTemplate>,
  relations: { file: true } as const satisfies FindOptionsRelations<PostTemplate>,
};
export type TFreyaPostTemplate = QueryResultType<
  PostTemplate & { text: string },
  typeof GetFreyaPostTemplateQuery.select
>;

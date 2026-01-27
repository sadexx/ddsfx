import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { ContactMethod } from 'src/modules/informational-pages/entities';

/**
 ** Query types
 */

export const GetContactMethodsQuery = {
  select: {
    id: true,
    description: true,
    url: true,
    file: { id: true, fileKey: true },
  } as const satisfies FindOptionsSelect<ContactMethod>,
  relations: { file: true } as const satisfies FindOptionsRelations<ContactMethod>,
};
export type TGetContactMethods = QueryResultType<ContactMethod, typeof GetContactMethodsQuery.select>;

export const UpdateContactMethodQuery = {
  select: {
    id: true,
    description: true,
    url: true,
    file: { id: true },
  } as const satisfies FindOptionsSelect<ContactMethod>,
  relations: { file: true } as const satisfies FindOptionsRelations<ContactMethod>,
};
export type TUpdateContactMethod = QueryResultType<ContactMethod, typeof UpdateContactMethodQuery.select>;

import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { DeceasedHobby, DeceasedHobbyTagCategory } from 'src/modules/deceased-highlights/entities';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const GetDeceasedHobbiesQuery = {
  select: {
    id: true,
    description: true,
    deceasedHobbyTags: { id: true, name: true },
  } as const satisfies FindOptionsSelect<DeceasedHobby>,
  relations: { deceasedHobbyTags: true } as const satisfies FindOptionsRelations<DeceasedHobby>,
};
export type TGetDeceasedHobbies = QueryResultType<DeceasedHobby, typeof GetDeceasedHobbiesQuery.select>;

export const GetDeceasedHobbyTagsQuery = {
  select: {
    id: true,
    name: true,
    deceasedHobbyTags: { id: true, name: true },
  } as const satisfies FindOptionsSelect<DeceasedHobbyTagCategory>,
  relations: { deceasedHobbyTags: true } as const satisfies FindOptionsRelations<DeceasedHobbyTagCategory>,
};
export type TGetDeceasedHobbyTags = QueryResultType<DeceasedHobbyTagCategory, typeof GetDeceasedHobbyTagsQuery.select>;

export const CreateDeceasedHobbyQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TCreateDeceasedHobby = QueryResultType<Deceased, typeof CreateDeceasedHobbyQuery.select>;

export const UpdateDeceasedHobbyQuery = {
  select: {
    id: true,
    description: true,
    deceased: { id: true },
    deceasedHobbyTags: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedHobby>,
  relations: { deceased: true, deceasedHobbyTags: true } as const satisfies FindOptionsRelations<DeceasedHobby>,
};
export type TUpdateDeceasedHobby = QueryResultType<DeceasedHobby, typeof UpdateDeceasedHobbyQuery.select>;

export const RemoveDeceasedHobbyQuery = {
  select: {
    id: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedHobby>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedHobby>,
};
export type TRemoveDeceasedHobby = QueryResultType<DeceasedHobby, typeof RemoveDeceasedHobbyQuery.select>;

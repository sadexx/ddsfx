import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { DeceasedBiography } from 'src/modules/deceased-highlights/entities';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const GetDeceasedBiographiesQuery = {
  select: {
    id: true,
    description: true,
  } as const satisfies FindOptionsSelect<DeceasedBiography>,
};
export type TGetDeceasedBiographies = QueryResultType<DeceasedBiography, typeof GetDeceasedBiographiesQuery.select>;

export const CreateDeceasedBiographyQuery = {
  select: {
    id: true,
    deceasedBiographies: { id: true },
  } as const satisfies FindOptionsSelect<Deceased>,
  relations: { deceasedBiographies: true } as const satisfies FindOptionsRelations<Deceased>,
};
export type TCreateDeceasedBiography = QueryResultType<Deceased, typeof CreateDeceasedBiographyQuery.select>;

export const UpdateDeceasedBiographyQuery = {
  select: {
    id: true,
    description: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedBiography>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedBiography>,
};
export type TUpdateDeceasedBiography = QueryResultType<DeceasedBiography, typeof UpdateDeceasedBiographyQuery.select>;

export const RemoveDeceasedBiographyQuery = {
  select: {
    id: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedBiography>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedBiography>,
};
export type TRemoveDeceasedBiography = QueryResultType<DeceasedBiography, typeof RemoveDeceasedBiographyQuery.select>;

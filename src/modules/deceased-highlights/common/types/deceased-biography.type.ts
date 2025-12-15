import { FindOptionsSelect } from 'typeorm';
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
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TCreateDeceasedBiography = QueryResultType<Deceased, typeof CreateDeceasedBiographyQuery.select>;

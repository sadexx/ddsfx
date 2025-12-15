import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Deceased } from 'src/modules/deceased/entities';
import { DeceasedResidence } from 'src/modules/deceased-highlights/entities';

/**
 ** Query types
 */

export const GetDeceasedResidencesQuery = {
  select: {
    id: true,
    city: true,
    country: true,
    startYear: true,
    endYear: true,
    description: true,
  } as const satisfies FindOptionsSelect<DeceasedResidence>,
};
export type TGetDeceasedResidences = QueryResultType<DeceasedResidence, typeof GetDeceasedResidencesQuery.select>;

export const CreateDeceasedResidencesQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TCreateDeceasedResidences = QueryResultType<Deceased, typeof CreateDeceasedResidencesQuery.select>;

export const UpdateDeceasedResidenceQuery = {
  select: {
    id: true,
    city: true,
    country: true,
    startYear: true,
    endYear: true,
    description: true,
    isBirthPlace: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedResidence>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedResidence>,
};
export type TUpdateDeceasedResidence = QueryResultType<DeceasedResidence, typeof UpdateDeceasedResidenceQuery.select>;

export const RemoveDeceasedResidenceQuery = {
  select: {
    id: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedResidence>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedResidence>,
};
export type TRemoveDeceasedResidence = QueryResultType<DeceasedResidence, typeof RemoveDeceasedResidenceQuery.select>;

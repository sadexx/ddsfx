import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Deceased } from 'src/modules/deceased/entities';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

/**
 ** Types
 */

export type TCreateDeceasedResidences = Pick<Deceased, 'id'> & {
  deceasedPlaceEntries: Pick<DeceasedPlaceEntry, 'id'>[];
};

export type TUpdateDeceasedResidence = TBaseUpdateDeceasedResidence & {
  city: ReferenceCatalog;
  isBirthPlace: boolean;
};

/**
 ** Query types
 */

export const GetDeceasedResidencesQuery = {
  select: {
    id: true,
    startYear: true,
    endYear: true,
    description: true,
    isBirthPlace: true,
    city: { id: true, value: true, file: { id: true, fileKey: true } },
    user: { id: true, profile: { firstName: true, lastName: true, middleName: true } },
  } as const satisfies FindOptionsSelect<DeceasedPlaceEntry>,
  relations: {
    city: { file: true },
    user: { profile: true },
  } as const satisfies FindOptionsRelations<DeceasedPlaceEntry>,
};
export type TGetDeceasedResidences = QueryResultType<DeceasedPlaceEntry, typeof GetDeceasedResidencesQuery.select>;

export const UpdateDeceasedResidenceQuery = {
  select: {
    id: true,
    startYear: true,
    endYear: true,
    description: true,
    isBirthPlace: true,
    user: { id: true },
    city: { id: true },
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedPlaceEntry>,
  relations: { user: true, city: true, deceased: true } as const satisfies FindOptionsRelations<DeceasedPlaceEntry>,
};
type TBaseUpdateDeceasedResidence = QueryResultType<DeceasedPlaceEntry, typeof UpdateDeceasedResidenceQuery.select>;

export const RemoveDeceasedResidenceQuery = {
  select: {
    id: true,
    user: { id: true },
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedPlaceEntry>,
  relations: { user: true, deceased: true } as const satisfies FindOptionsRelations<DeceasedPlaceEntry>,
};
export type TRemoveDeceasedResidence = QueryResultType<DeceasedPlaceEntry, typeof RemoveDeceasedResidenceQuery.select>;

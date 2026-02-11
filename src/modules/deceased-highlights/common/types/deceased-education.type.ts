import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';
import { Deceased } from 'src/modules/deceased/entities';
import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

/**
 ** Types
 */

export type TDeceasedEducationType =
  | typeof EDeceasedPlaceEntryType.SECONDARY_EDUCATION
  | typeof EDeceasedPlaceEntryType.HIGHER_EDUCATION;

export type TCreateDeceasedEducations = Pick<Deceased, 'id'> & {
  deceasedPlaceEntries: Pick<DeceasedPlaceEntry, 'id'>[];
};

export type TUpdateDeceasedEducation = TBaseUpdateDeceasedEducation & {
  type: TDeceasedEducationType;
  institutionName: ReferenceCatalog;
  specialization: ReferenceCatalog | null;
};

/**
 ** Query types
 */

export const GetDeceasedEducationsQuery = {
  select: {
    id: true,
    type: true,
    description: true,
    startYear: true,
    endYear: true,
    institutionName: { id: true, value: true, file: { id: true, fileKey: true } },
    specialization: { id: true, value: true, file: { id: true, fileKey: true } },
    user: { id: true, profile: { firstName: true, lastName: true, middleName: true } },
  } as const satisfies FindOptionsSelect<DeceasedPlaceEntry>,
  relations: {
    institutionName: { file: true },
    specialization: { file: true },
    user: { profile: true },
  } as const satisfies FindOptionsRelations<DeceasedPlaceEntry>,
};
export type TGetDeceasedEducations = QueryResultType<DeceasedPlaceEntry, typeof GetDeceasedEducationsQuery.select>;

export const UpdateDeceasedEducationQuery = {
  select: {
    id: true,
    startYear: true,
    endYear: true,
    type: true,
    description: true,
    user: { id: true },
    institutionName: { id: true },
    specialization: { id: true },
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedPlaceEntry>,
  relations: {
    user: true,
    institutionName: true,
    specialization: true,
    deceased: true,
  } as const satisfies FindOptionsRelations<DeceasedPlaceEntry>,
};
type TBaseUpdateDeceasedEducation = QueryResultType<DeceasedPlaceEntry, typeof UpdateDeceasedEducationQuery.select>;

export const RemoveDeceasedEducationQuery = {
  select: {
    id: true,
    user: { id: true },
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedPlaceEntry>,
  relations: { user: true, deceased: true } as const satisfies FindOptionsRelations<DeceasedPlaceEntry>,
};
export type TRemoveDeceasedEducation = QueryResultType<DeceasedPlaceEntry, typeof RemoveDeceasedEducationQuery.select>;

import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { DeceasedEducation } from 'src/modules/deceased-highlights/entities';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const GetDeceasedEducationsQuery = {
  select: {
    id: true,
    type: true,
    institutionName: true,
    city: true,
    country: true,
    specialization: true,
    description: true,
    startYear: true,
    endYear: true,
  } as const satisfies FindOptionsSelect<DeceasedEducation>,
};
export type TGetDeceasedEducations = QueryResultType<DeceasedEducation, typeof GetDeceasedEducationsQuery.select>;

export const CreateDeceasedEducationsQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TCreateDeceasedEducations = QueryResultType<Deceased, typeof CreateDeceasedEducationsQuery.select>;

export const UpdateDeceasedEducationQuery = {
  select: {
    id: true,
    startYear: true,
    endYear: true,
    type: true,
    city: true,
    institutionName: true,
    country: true,
    specialization: true,
    description: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedEducation>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedEducation>,
};
export type TUpdateDeceasedEducation = QueryResultType<DeceasedEducation, typeof UpdateDeceasedEducationQuery.select>;

export const RemoveDeceasedEducationQuery = {
  select: {
    id: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedEducation>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedEducation>,
};
export type TRemoveDeceasedEducation = QueryResultType<DeceasedEducation, typeof RemoveDeceasedEducationQuery.select>;

import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { DeceasedEmployment } from 'src/modules/deceased-highlights/entities';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const GetDeceasedEmploymentsQuery = {
  select: {
    id: true,
    position: true,
    companyName: true,
    description: true,
    startYear: true,
    endYear: true,
  } as const satisfies FindOptionsSelect<DeceasedEmployment>,
};
export type TGetDeceasedEmployments = QueryResultType<DeceasedEmployment, typeof GetDeceasedEmploymentsQuery.select>;

export const CreateDeceasedEmploymentsQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TCreateDeceasedEmployments = QueryResultType<Deceased, typeof CreateDeceasedEmploymentsQuery.select>;

export const UpdateDeceasedEmploymentQuery = {
  select: {
    id: true,
    companyName: true,
    position: true,
    description: true,
    startYear: true,
    endYear: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedEmployment>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedEmployment>,
};
export type TUpdateDeceasedEmployment = QueryResultType<
  DeceasedEmployment,
  typeof UpdateDeceasedEmploymentQuery.select
>;

export const RemoveDeceasedEmploymentQuery = {
  select: {
    id: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedEmployment>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedEmployment>,
};
export type TRemoveDeceasedEmployment = QueryResultType<
  DeceasedEmployment,
  typeof RemoveDeceasedEmploymentQuery.select
>;

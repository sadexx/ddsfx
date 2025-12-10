import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Cemetery, GraveLocation } from 'src/modules/cemetery/entities';
import { User } from 'src/modules/users/entities';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';

/**
 ** Types
 */

export type TGetDeceasedProfile = Pick<
  Deceased,
  | 'id'
  | 'biography'
  | 'firstName'
  | 'lastName'
  | 'middleName'
  | 'deathDay'
  | 'deathMonth'
  | 'deathYear'
  | 'birthDay'
  | 'birthMonth'
  | 'birthYear'
  | 'status'
> & {
  cemetery: Pick<Cemetery, 'id' | 'name'> | null;
  graveLocation: Pick<GraveLocation, 'id' | 'latitude' | 'longitude' | 'altitude'> | null;
  deceasedSubscriptions: Pick<DeceasedSubscription, 'id'>[];
};

/**
 ** Query types
 */

export const CreateDeceasedProfileUserQuery = {
  select: {
    id: true,
    profile: { id: true },
  } as const satisfies FindOptionsSelect<User>,
  relations: { profile: true } as const satisfies FindOptionsRelations<User>,
};
export type TCreateDeceasedProfileUser = QueryResultType<User, typeof CreateDeceasedProfileUserQuery.select>;

export const CreateDeceasedProfileCemeteryQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Cemetery>,
};
export type TCreateDeceasedProfileCemetery = QueryResultType<
  Cemetery,
  typeof CreateDeceasedProfileCemeteryQuery.select
>;

export const UpdateDeceasedProfileQuery = {
  select: {
    id: true,
    biography: true,
    firstName: true,
    lastName: true,
    middleName: true,
    deathDay: true,
    deathMonth: true,
    deathYear: true,
    deathDate: true,
    birthDay: true,
    birthMonth: true,
    birthYear: true,
    birthDate: true,
    status: true,
    graveLocation: { id: true, latitude: true, longitude: true, altitude: true, cemetery: { id: true } },
  } as const satisfies FindOptionsSelect<Deceased>,
  relations: { graveLocation: { cemetery: true } } as const satisfies FindOptionsRelations<Deceased>,
};
export type TUpdateDeceasedProfile = QueryResultType<Deceased, typeof UpdateDeceasedProfileQuery.select>;

export const UpdateDeceasedProfileCemeteryQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Cemetery>,
};
export type TUpdateDeceasedProfileCemetery = QueryResultType<Cemetery, typeof UpdateDeceasedProfileQuery.select>;

import { FindOptionsSelect, FindOptionsRelations } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Deceased, DeceasedSubscription } from 'src/modules/deceased/entities';
import { User, UserProfile } from 'src/modules/users/entities';

/**
 ** Types
 */

export type TConstructAndCreateDeceasedSubscriptionUser = Pick<User, 'id'> & {
  profile: Pick<UserProfile, 'id'> | null;
};

export type TConstructAndCreateDeceasedSubscriptionDeceased = Pick<Deceased, 'id'>;

/**
 ** Query types
 */

export const GetMyDeceasedSubscriptionsQuery = {
  select: {
    id: true,
    deceased: {
      id: true,
      firstName: true,
      lastName: true,
      middleName: true,
      deceasedMediaContents: { id: true, memoryFileKey: true, isPrimary: true, file: { id: true, fileKey: true } },
    },
  } as const satisfies FindOptionsSelect<DeceasedSubscription>,
  relations: {
    deceased: { deceasedMediaContents: { file: true } },
  } as const satisfies FindOptionsRelations<DeceasedSubscription>,
};
export type TGetMyDeceasedSubscriptions = QueryResultType<
  DeceasedSubscription,
  typeof GetMyDeceasedSubscriptionsQuery.select
>;

export const GetDeceasedSubscriptionsQuery = {
  select: {
    id: true,
    kinshipType: true,
    user: {
      id: true,
      profile: { firstName: true, lastName: true, middleName: true },
      avatar: { id: true, file: { id: true, fileKey: true } },
    },
    creationDate: true,
  } as const satisfies FindOptionsSelect<DeceasedSubscription>,
  relations: {
    user: { profile: true, avatar: { file: true } },
  } as const satisfies FindOptionsRelations<DeceasedSubscription>,
};
export type TGetDeceasedSubscriptions = QueryResultType<
  DeceasedSubscription,
  typeof GetDeceasedSubscriptionsQuery.select
>;

export const GetDeceasedSubscriptionQuery = {
  select: {
    id: true,
    kinshipType: true,
    user: {
      id: true,
      profile: { firstName: true, lastName: true, middleName: true },
      avatar: { id: true, file: { id: true, fileKey: true } },
    },
    creationDate: true,
  } as const satisfies FindOptionsSelect<DeceasedSubscription>,
  relations: {
    user: { profile: true, avatar: { file: true } },
  } as const satisfies FindOptionsRelations<DeceasedSubscription>,
};
export type TGetDeceasedSubscription = QueryResultType<
  DeceasedSubscription,
  typeof GetDeceasedSubscriptionQuery.select
>;

export const SubscribeDeceasedProfileUserQuery = {
  select: {
    id: true,
    profile: { id: true },
  } as const satisfies FindOptionsSelect<User>,
  relations: { profile: true } as const satisfies FindOptionsRelations<User>,
};
export type TSubscribeDeceasedProfileUser = QueryResultType<User, typeof SubscribeDeceasedProfileUserQuery.select>;

export const SubscribeDeceasedProfileDeceasedQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TSubscribeDeceasedProfileDeceased = QueryResultType<
  Deceased,
  typeof SubscribeDeceasedProfileDeceasedQuery.select
>;

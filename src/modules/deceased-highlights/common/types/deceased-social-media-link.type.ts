import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { DeceasedSocialMediaLink } from 'src/modules/deceased-highlights/entities';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const GetDeceasedSocialMediaLinksQuery = {
  select: {
    id: true,
    platform: true,
    url: true,
  } as const satisfies FindOptionsSelect<DeceasedSocialMediaLink>,
};
export type TGetDeceasedSocialMediaLinks = QueryResultType<
  DeceasedSocialMediaLink,
  typeof GetDeceasedSocialMediaLinksQuery.select
>;

export const CreateDeceasedSocialMediaLinkQuery = {
  select: {
    id: true,
  } as const satisfies FindOptionsSelect<Deceased>,
};
export type TCreateDeceasedSocialMediaLink = QueryResultType<
  Deceased,
  typeof CreateDeceasedSocialMediaLinkQuery.select
>;

export const UpdateDeceasedSocialMediaLinkQuery = {
  select: {
    id: true,
    platform: true,
    url: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedSocialMediaLink>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedSocialMediaLink>,
};
export type TUpdateDeceasedSocialMediaLink = QueryResultType<
  DeceasedSocialMediaLink,
  typeof UpdateDeceasedSocialMediaLinkQuery.select
>;

export const RemoveDeceasedSocialMediaLinkQuery = {
  select: {
    id: true,
    deceased: { id: true },
  } as const satisfies FindOptionsSelect<DeceasedSocialMediaLink>,
  relations: { deceased: true } as const satisfies FindOptionsRelations<DeceasedSocialMediaLink>,
};
export type TRemoveDeceasedSocialMediaLink = QueryResultType<
  DeceasedSocialMediaLink,
  typeof RemoveDeceasedSocialMediaLinkQuery.select
>;

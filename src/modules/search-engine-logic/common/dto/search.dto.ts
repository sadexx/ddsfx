import { Type, Static } from '@sinclair/typebox';

export const SearchQueryDto = Type.Object(
  {
    query: Type.String({
      minLength: 3,
      maxLength: 100,
      description: 'Search query for first name, last name, or full name',
    }),
  },
  { additionalProperties: false },
);

export type SearchQueryDto = Static<typeof SearchQueryDto>;

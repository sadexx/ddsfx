import { Type } from '@sinclair/typebox';
import { Static } from '@sinclair/typebox';
import { EWebSocketEventTypes } from '../enum';

export const SearchEventDto = Type.Object(
  {
    event: Type.Literal(EWebSocketEventTypes.SEARCH_REQUEST),
    query: Type.String({
      minLength: 1,
      maxLength: 100,
      description: 'Search query for first name, last name, or full name',
    }),
  },
  { additionalProperties: false },
);

export type SearchEventDto = Static<typeof SearchEventDto>;

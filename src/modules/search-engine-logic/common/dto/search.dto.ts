import { Type, Static } from '@sinclair/typebox';
import { THIS_YEAR } from 'src/common/constants';

export const SearchQueryDto = Type.Object(
  {
    query: Type.String({
      minLength: 3,
      maxLength: 100,
      description: 'Search query for first name, last name, or full name',
    }),
    cemeteryName: Type.Optional(
      Type.String({
        minLength: 1,
        maxLength: 100,
        description: 'Filter by cemetery name',
      }),
    ),
    birthDay: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 31,
        description: 'Filter by birth day (1-31)',
      }),
    ),
    birthMonth: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 12,
        description: 'Filter by birth month (1-12)',
      }),
    ),
    birthYear: Type.Optional(
      Type.Integer({
        minimum: 1800,
        maximum: THIS_YEAR,
        description: 'Filter by birth year',
      }),
    ),
    deathDay: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 31,
        description: 'Filter by death day (1-31)',
      }),
    ),
    deathMonth: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 12,
        description: 'Filter by death month (1-12)',
      }),
    ),
    deathYear: Type.Optional(
      Type.Integer({
        minimum: 1800,
        maximum: THIS_YEAR,
        description: 'Filter by death year',
      }),
    ),
    page: Type.Integer({
      minimum: 1,
      default: 1,
      description: 'Page number for pagination',
    }),
    pageSize: Type.Integer({
      minimum: 1,
      maximum: 50,
      default: 10,
      description: 'Number of results per page',
    }),
  },
  { additionalProperties: false },
);

export type SearchQueryDto = Static<typeof SearchQueryDto>;

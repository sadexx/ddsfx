import { Static, Type } from '@sinclair/typebox';
import { StandardStringPattern } from 'src/common/validators';

export const GetFamousDeceasedDto = Type.Object(
  { cemeteryName: Type.Optional(StandardStringPattern) },
  { additionalProperties: false },
);

export type GetFamousDeceasedDto = Static<typeof GetFamousDeceasedDto>;

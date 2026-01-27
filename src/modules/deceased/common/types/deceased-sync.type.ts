import { FindOptionsSelect, FindOptionsRelations } from 'typeorm';
import { QueryResultType } from 'src/common/types';
import { Deceased } from 'src/modules/deceased/entities';

/**
 ** Query types
 */

export const LoadDeceasedWithRelationsQuery = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    middleName: true,
    birthDate: true,
    birthDay: true,
    birthMonth: true,
    birthYear: true,
    deathDate: true,
    deathDay: true,
    deathMonth: true,
    deathYear: true,
    graveLocation: {
      id: true,
      latitude: true,
      longitude: true,
      altitude: true,
      cemetery: { id: true, name: true, address: { id: true, region: true } },
    },
    deceasedSubscriptions: { id: true, creationDate: true },
    deceasedMediaContents: { id: true, isPrimary: true, memoryFileKey: true, file: { id: true, fileKey: true } },
  } as const satisfies FindOptionsSelect<Deceased>,
  relations: {
    graveLocation: { cemetery: { address: true } },
    deceasedSubscriptions: true,
    deceasedMediaContents: { file: true },
  } as const satisfies FindOptionsRelations<Deceased>,
};
export type TLoadDeceasedWithRelations = QueryResultType<Deceased, typeof LoadDeceasedWithRelationsQuery.select>;

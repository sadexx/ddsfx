import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js';
import { OpenSearchMappings } from 'src/libs/opensearch/services';
import { PersonSchema } from 'src/modules/search-engine-logic/schemas/person.schema';

export const PersonMappings: Record<keyof PersonSchema, Property> = {
  id: OpenSearchMappings.keyword(),
  originalId: OpenSearchMappings.integer(),
  gpsLatitude: OpenSearchMappings.float(),
  gpsAltitude: OpenSearchMappings.float(),
  gpsLongitude: OpenSearchMappings.float(),
  cemeteryName: OpenSearchMappings.keyword(),
  regionName: OpenSearchMappings.keyword(),
  regionFullName: OpenSearchMappings.keyword(),
  status: OpenSearchMappings.keyword(),
  isFamousPerson: OpenSearchMappings.boolean(),
  gender: OpenSearchMappings.keyword(),
  firstName: OpenSearchMappings.textWithNgram(),
  lastName: OpenSearchMappings.textWithNgram(),
  middleName: OpenSearchMappings.textWithNgram(),
  fullName: OpenSearchMappings.textFullName(),
  birthDate: OpenSearchMappings.date(),
  deathDate: OpenSearchMappings.date(),
  birthYear: OpenSearchMappings.integer(),
  birthMonth: OpenSearchMappings.integer(),
  birthDay: OpenSearchMappings.integer(),
  deathYear: OpenSearchMappings.integer(),
  deathMonth: OpenSearchMappings.integer(),
  deathDay: OpenSearchMappings.integer(),
  fileKey: OpenSearchMappings.keyword(),
  portraitFileKey: OpenSearchMappings.keyword(),
  deceasedSubscriptions: OpenSearchMappings.nested({
    id: OpenSearchMappings.keyword(),
    fileKey: OpenSearchMappings.keyword(),
  }),
  deceasedSubscriptionsCount: OpenSearchMappings.integer(),
};

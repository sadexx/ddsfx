import { TDeceasedEducationType } from 'src/modules/deceased-highlights/common/types';
import { CreatePayload } from 'src/common/types';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

export interface IDeceasedEducation extends CreatePayload<DeceasedPlaceEntry, 'city' | 'isBirthPlace'> {
  type: TDeceasedEducationType;
  institutionName: ReferenceCatalog;
}

import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';
import { CreatePayload } from 'src/common/types';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';

export interface IDeceasedResidence extends CreatePayload<DeceasedPlaceEntry, 'institutionName' | 'specialization'> {
  type: typeof EDeceasedPlaceEntryType.RESIDENCE;
  city: ReferenceCatalog;
  isBirthPlace: boolean;
}

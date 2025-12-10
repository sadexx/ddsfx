import { TCreateDeceasedProfileCemetery, TUpdateDeceasedProfileCemetery } from 'src/modules/deceased/common/types';
import { TConstructGraveLocationDtoDeceased } from 'src/modules/cemetery/common/types';

export interface IGraveLocation {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  cemetery: TCreateDeceasedProfileCemetery | TUpdateDeceasedProfileCemetery;
  deceased: TConstructGraveLocationDtoDeceased;
}

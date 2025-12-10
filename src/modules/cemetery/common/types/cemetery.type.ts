import { Deceased } from 'src/modules/deceased/entities';
import { Cemetery } from 'src/modules/cemetery/entities';

/**
 ** Types
 */

export type TGetCemeteries = Pick<Cemetery, 'id' | 'name'>;

export type TConstructGraveLocationDtoDeceased = Pick<Deceased, 'id'>;

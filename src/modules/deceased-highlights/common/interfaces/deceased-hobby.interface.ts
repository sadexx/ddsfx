import { DeceasedHobbyTag } from 'src/modules/deceased-highlights/entities';
import { TCreateDeceasedHobby } from 'src/modules/deceased-highlights/common/types';

export interface IDeceasedHobby {
  description: string;
  deceased: TCreateDeceasedHobby;
  deceasedHobbyTags: DeceasedHobbyTag[];
}

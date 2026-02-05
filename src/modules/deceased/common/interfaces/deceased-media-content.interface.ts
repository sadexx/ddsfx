import { EDeceasedMediaContentType } from 'src/modules/deceased/common/enums';
import { File } from 'src/libs/file-management/entities';
import { TCreateDeceasedMediaContent } from 'src/modules/deceased/common/types';

export interface IDeceasedMediaContent {
  contentType: EDeceasedMediaContentType;
  order: number;
  deceased: TCreateDeceasedMediaContent;
  file: File;
}

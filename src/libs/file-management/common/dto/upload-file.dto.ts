import { Type } from '@sinclair/typebox';
import { EFileType } from 'src/libs/file-management/common/enums';

export class UploadFileDto {
  category: EFileType;

  static readonly schema = Type.Object(
    { category: Type.String({ enum: Object.values(EFileType) }) },
    { additionalProperties: false },
  );
}

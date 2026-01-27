import { Type } from '@sinclair/typebox';
import { UUIDPattern } from 'src/common/validators';
import { FILE_CONFIG } from 'src/libs/file-management/common/constants';

export class CreatePostMediaContentDto {
  id: string;
  order: number;

  static readonly schema = Type.Object(
    { id: UUIDPattern, order: Type.Number({ minimum: 1, maximum: FILE_CONFIG.MAX_FILES }) },
    { additionalProperties: false },
  );
}

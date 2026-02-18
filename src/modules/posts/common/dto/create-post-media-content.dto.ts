import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { UUIDPattern } from 'src/common/validators';
import { FILE_CONFIG } from 'src/libs/file-management/common/constants';

export class CreatePostMediaContentDto {
  id?: string;
  templateId?: string;
  order: number;

  static readonly schema = Type.Object(
    {
      id: Type.Optional(UUIDPattern),
      templateId: Type.Optional(UUIDPattern),
      order: Type.Number({ minimum: 1, maximum: FILE_CONFIG.MAX_FILES }),
    },
    { additionalProperties: false },
  );

  static validate(data: CreatePostMediaContentDto): void {
    if (!data.id && !data.templateId) {
      throw new BadRequestException('Either id or templateId must be provided');
    }
  }
}

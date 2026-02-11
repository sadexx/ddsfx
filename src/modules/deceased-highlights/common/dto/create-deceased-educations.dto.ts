import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';
import { TDeceasedEducationType } from 'src/modules/deceased-highlights/common/types/';
import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';

export class CreateDeceasedEducationDto {
  type: TDeceasedEducationType;
  institutionNameId: string;
  specializationId?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object(
    {
      type: Type.Union([
        Type.Literal(EDeceasedPlaceEntryType.SECONDARY_EDUCATION),
        Type.Literal(EDeceasedPlaceEntryType.HIGHER_EDUCATION),
      ]),
      institutionNameId: UUIDPattern,
      specializationId: Type.Optional(UUIDPattern),
      description: Type.Optional(StandardStringPattern),
      startYear: Type.Optional(YearPattern),
      endYear: Type.Optional(YearPattern),
    },
    { additionalProperties: false },
  );

  static validate(data: CreateDeceasedEducationDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

export class CreateDeceasedEducationsDto {
  educations: CreateDeceasedEducationDto[];

  static readonly schema = Type.Object(
    { educations: Type.Array(CreateDeceasedEducationDto.schema, { uniqueItems: true, minItems: 1 }) },
    { additionalProperties: false },
  );

  static validate(data: CreateDeceasedEducationsDto): void {
    for (const education of data.educations) {
      CreateDeceasedEducationDto.validate(education);
    }
  }
}

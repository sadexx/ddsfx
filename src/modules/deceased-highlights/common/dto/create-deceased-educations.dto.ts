import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';
import { EDeceasedEducationType } from 'src/modules/deceased-highlights/common/enums';

export class CreateDeceasedEducationDto {
  type: EDeceasedEducationType;
  institutionName: string;
  city?: string;
  country?: string;
  specialization?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object(
    {
      type: Type.Enum(EDeceasedEducationType),
      institutionName: StandardStringPattern,
      city: Type.Optional(StandardStringPattern),
      country: Type.Optional(StandardStringPattern),
      specialization: Type.Optional(StandardStringPattern),
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

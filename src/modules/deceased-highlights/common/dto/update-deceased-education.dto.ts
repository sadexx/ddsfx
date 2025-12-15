import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';
import { EDeceasedEducationType } from 'src/modules/deceased-highlights/common/enums';

export class UpdateDeceasedEducationDto {
  type?: EDeceasedEducationType;
  city?: string;
  institutionName?: string;
  country?: string;
  specialization?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object({
    type: Type.Optional(Type.Enum(EDeceasedEducationType)),
    city: Type.Optional(StandardStringPattern),
    institutionName: Type.Optional(StandardStringPattern),
    country: Type.Optional(StandardStringPattern),
    specialization: Type.Optional(StandardStringPattern),
    description: Type.Optional(StandardStringPattern),
    startYear: Type.Optional(YearPattern),
    endYear: Type.Optional(YearPattern),
  });

  static validate(data: UpdateDeceasedEducationDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

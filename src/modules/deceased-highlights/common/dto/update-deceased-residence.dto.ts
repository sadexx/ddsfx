import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';

export class UpdateDeceasedResidenceDto {
  city?: string;
  isBirthPlace?: boolean;
  country?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object({
    city: Type.Optional(StandardStringPattern),
    country: Type.Optional(StandardStringPattern),
    isBirthPlace: Type.Optional(Type.Boolean()),
    description: Type.Optional(StandardStringPattern),
    startYear: Type.Optional(YearPattern),
    endYear: Type.Optional(YearPattern),
  });

  static validate(data: UpdateDeceasedResidenceDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

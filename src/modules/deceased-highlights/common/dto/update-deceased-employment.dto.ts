import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';

export class UpdateDeceasedEmploymentDto {
  companyName?: string;
  position?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object({
    companyName: Type.Optional(StandardStringPattern),
    position: Type.Optional(StandardStringPattern),
    description: Type.Optional(StandardStringPattern),
    startYear: Type.Optional(YearPattern),
    endYear: Type.Optional(YearPattern),
  });

  static validate(data: UpdateDeceasedEmploymentDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

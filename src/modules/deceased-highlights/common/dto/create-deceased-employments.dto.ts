import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';

export class CreateDeceasedEmploymentDto {
  position: string;
  companyName?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object({
    position: StandardStringPattern,
    companyName: Type.Optional(StandardStringPattern),
    description: Type.Optional(StandardStringPattern),
    startYear: Type.Optional(YearPattern),
    endYear: Type.Optional(YearPattern),
  });

  static validate(data: CreateDeceasedEmploymentDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

export class CreateDeceasedEmploymentsDto {
  employments: CreateDeceasedEmploymentDto[];

  static readonly schema = Type.Object({
    employments: Type.Array(CreateDeceasedEmploymentDto.schema, { uniqueItems: true, minItems: 1 }),
  });

  static validate(data: CreateDeceasedEmploymentsDto): void {
    for (const employment of data.employments) {
      CreateDeceasedEmploymentDto.validate(employment);
    }
  }
}

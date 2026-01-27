import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';

export class UpdateDeceasedResidenceDto {
  city?: string;
  isBirthPlace?: boolean;
  country?: string | null;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;

  static readonly schema = Type.Object(
    {
      city: Type.Optional(StandardStringPattern),
      isBirthPlace: Type.Optional(Type.Boolean()),
      country: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      description: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      startYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
      endYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
    },
    { additionalProperties: false },
  );

  static validate(data: UpdateDeceasedResidenceDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

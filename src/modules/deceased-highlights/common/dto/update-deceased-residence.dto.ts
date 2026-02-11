import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';

export class UpdateDeceasedResidenceDto {
  cityId?: string;
  isBirthPlace?: boolean;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;

  static readonly schema = Type.Object(
    {
      cityId: Type.Optional(UUIDPattern),
      isBirthPlace: Type.Optional(Type.Boolean()),
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

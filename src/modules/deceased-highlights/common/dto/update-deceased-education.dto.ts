import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';
import { EDeceasedEducationType } from 'src/modules/deceased-highlights/common/enums';

export class UpdateDeceasedEducationDto {
  type?: EDeceasedEducationType;
  institutionName?: string;
  city?: string | null;
  country?: string | null;
  specialization?: string | null;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;

  static readonly schema = Type.Object(
    {
      type: Type.Optional(Type.Enum(EDeceasedEducationType)),
      institutionName: Type.Optional(StandardStringPattern),
      city: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      country: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      specialization: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      description: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      startYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
      endYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
    },
    { additionalProperties: false },
  );

  static validate(data: UpdateDeceasedEducationDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

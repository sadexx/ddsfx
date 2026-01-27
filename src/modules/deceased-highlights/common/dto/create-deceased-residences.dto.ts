import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, YearPattern } from 'src/common/validators';

export class CreateDeceasedResidenceDto {
  city: string;
  isBirthPlace?: boolean;
  country?: string;
  description?: string;
  startYear?: number;
  endYear?: number;

  static readonly schema = Type.Object(
    {
      city: StandardStringPattern,
      isBirthPlace: Type.Optional(Type.Boolean()),
      country: Type.Optional(StandardStringPattern),
      description: Type.Optional(StandardStringPattern),
      startYear: Type.Optional(YearPattern),
      endYear: Type.Optional(YearPattern),
    },
    { additionalProperties: false },
  );

  static validate(data: CreateDeceasedResidenceDto): void {
    if (data.startYear && data.endYear && data.startYear > data.endYear) {
      throw new BadRequestException('Start year cannot be after end year');
    }
  }
}

export class CreateDeceasedResidencesDto {
  residences: CreateDeceasedResidenceDto[];

  static readonly schema = Type.Object(
    { residences: Type.Array(CreateDeceasedResidenceDto.schema, { minItems: 1 }) },
    { additionalProperties: false },
  );

  static validate(data: CreateDeceasedResidencesDto): void {
    for (const residence of data.residences) {
      CreateDeceasedResidenceDto.validate(residence);
    }

    const birthPlaces = data.residences.filter((residence) => residence.isBirthPlace === true);

    if (birthPlaces.length > 1) {
      throw new BadRequestException('Only one residence can be marked as birthplace');
    }
  }
}

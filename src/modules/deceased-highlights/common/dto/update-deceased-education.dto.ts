import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';
import { TDeceasedEducationType } from 'src/modules/deceased-highlights/common/types';
import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';

export class UpdateDeceasedEducationDto {
  type?: TDeceasedEducationType;
  institutionNameId?: string;
  specializationId?: string | null;
  description?: string | null;
  startYear?: number | null;
  endYear?: number | null;

  static readonly schema = Type.Object(
    {
      type: Type.Optional(
        Type.Union([
          Type.Literal(EDeceasedPlaceEntryType.SECONDARY_EDUCATION),
          Type.Literal(EDeceasedPlaceEntryType.HIGHER_EDUCATION),
        ]),
      ),
      institutionNameId: Type.Optional(UUIDPattern),
      specializationId: Type.Optional(Type.Union([UUIDPattern, Type.Null()])),
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

import { Type } from '@sinclair/typebox';
import { DayPattern, MonthPattern, StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';
import { UpdateGraveLocationDto } from 'src/modules/cemetery/common/dto';

export class UpdateDeceasedProfileDto {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  deathDay?: number | null;
  deathMonth?: number | null;
  deathYear?: number | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthYear?: number | null;
  cemeteryId?: string;
  graveLocation?: UpdateGraveLocationDto;

  static readonly schema = Type.Object(
    {
      firstName: Type.Optional(StandardStringPattern),
      lastName: Type.Optional(StandardStringPattern),
      middleName: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      deathDay: Type.Optional(Type.Union([DayPattern, Type.Null()])),
      deathMonth: Type.Optional(Type.Union([MonthPattern, Type.Null()])),
      deathYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
      birthDay: Type.Optional(Type.Union([DayPattern, Type.Null()])),
      birthMonth: Type.Optional(Type.Union([MonthPattern, Type.Null()])),
      birthYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
      cemeteryId: Type.Optional(UUIDPattern),
      graveLocation: Type.Optional(UpdateGraveLocationDto.schema),
    },
    { additionalProperties: false },
  );
}

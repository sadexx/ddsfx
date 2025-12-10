import { Type } from '@sinclair/typebox';
import { DayPattern, MonthPattern, StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';
import { UpdateGraveLocationDto } from 'src/modules/cemetery/common/dto';

export class UpdateDeceasedProfileDto {
  biography?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  deathDay?: number;
  deathMonth?: number;
  deathYear?: number;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  cemeteryId?: string;
  graveLocation?: UpdateGraveLocationDto;

  static readonly schema = Type.Object(
    {
      biography: Type.Optional(Type.String({ minLength: 10, maxLength: 1000 })),
      firstName: Type.Optional(StandardStringPattern),
      lastName: Type.Optional(StandardStringPattern),
      middleName: Type.Optional(StandardStringPattern),
      deathDay: Type.Optional(DayPattern),
      deathMonth: Type.Optional(MonthPattern),
      deathYear: Type.Optional(YearPattern),
      birthDay: Type.Optional(DayPattern),
      birthMonth: Type.Optional(MonthPattern),
      birthYear: Type.Optional(YearPattern),
      cemeteryId: Type.Optional(UUIDPattern),
      graveLocation: Type.Optional(UpdateGraveLocationDto.schema),
    },
    { additionalProperties: false },
  );
}

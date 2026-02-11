import { Type } from '@sinclair/typebox';
import { DayPattern, MonthPattern, StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';
import { UpdateGraveLocationDto } from 'src/modules/cemetery/common/dto';
import { validateBirthBeforeDeath, validateDateConfirmationRequirement } from 'src/modules/deceased/common/validators';
import { EUserGender } from 'src/modules/users/common/enum';

export class UpdateDeceasedProfileDto {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  gender?: EUserGender;
  deathDay?: number | null;
  deathMonth?: number | null;
  deathYear?: number | null;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthYear?: number | null;
  confirmInvalidDate?: boolean;
  cemeteryId?: string;
  graveLocation?: UpdateGraveLocationDto;

  static readonly schema = Type.Object(
    {
      firstName: Type.Optional(StandardStringPattern),
      lastName: Type.Optional(StandardStringPattern),
      middleName: Type.Optional(Type.Union([StandardStringPattern, Type.Null()])),
      gender: Type.Optional(Type.Enum(EUserGender)),
      deathDay: Type.Optional(Type.Union([DayPattern, Type.Null()])),
      deathMonth: Type.Optional(Type.Union([MonthPattern, Type.Null()])),
      deathYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
      birthDay: Type.Optional(Type.Union([DayPattern, Type.Null()])),
      birthMonth: Type.Optional(Type.Union([MonthPattern, Type.Null()])),
      birthYear: Type.Optional(Type.Union([YearPattern, Type.Null()])),
      confirmInvalidDate: Type.Optional(Type.Boolean()),
      cemeteryId: Type.Optional(UUIDPattern),
      graveLocation: Type.Optional(UpdateGraveLocationDto.schema),
    },
    { additionalProperties: false },
  );

  static validate(data: UpdateDeceasedProfileDto): void {
    if (data.birthDay && data.birthMonth && data.birthYear) {
      validateDateConfirmationRequirement(data.birthDay, data.birthMonth, data.birthYear, data.confirmInvalidDate);
    }

    if (data.deathDay && data.deathMonth && data.deathYear) {
      validateDateConfirmationRequirement(data.deathDay, data.deathMonth, data.deathYear, data.confirmInvalidDate);
    }

    validateBirthBeforeDeath(
      data.birthYear,
      data.birthMonth,
      data.birthDay,
      data.deathYear,
      data.deathMonth,
      data.deathDay,
    );
  }
}

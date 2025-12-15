import { Type } from '@sinclair/typebox';
import { DayPattern, MonthPattern, StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';

export class CreateDeceasedCorrectionDto {
  deceasedId: string;
  genderCode?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  deathYear?: number;
  deathMonth?: number;
  deathDay?: number;
  comment?: string;

  static readonly schema = Type.Object(
    {
      deceasedId: UUIDPattern,
      genderCode: Type.Optional(StandardStringPattern),
      firstName: Type.Optional(StandardStringPattern),
      lastName: Type.Optional(StandardStringPattern),
      middleName: Type.Optional(StandardStringPattern),
      birthYear: Type.Optional(YearPattern),
      birthMonth: Type.Optional(MonthPattern),
      birthDay: Type.Optional(DayPattern),
      deathYear: Type.Optional(YearPattern),
      deathMonth: Type.Optional(MonthPattern),
      deathDay: Type.Optional(DayPattern),
      comment: Type.Optional(Type.String({ minLength: 5, maxLength: 1000 })),
    },
    { additionalProperties: false },
  );
}

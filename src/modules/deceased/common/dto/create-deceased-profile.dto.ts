import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { DayPattern, MonthPattern, StandardStringPattern, UUIDPattern, YearPattern } from 'src/common/validators';
import { CreateGraveLocationDto } from 'src/modules/cemetery/common/dto';
import { CreateDeceasedSubscriptionDto } from 'src/modules/deceased/common/dto';
import { validateBirthBeforeDeath, validateDateConfirmationRequirement } from 'src/modules/deceased/common/validators';
import { EUserGender } from 'src/modules/users/common/enum';

export class CreateDeceasedProfileDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender: EUserGender;
  deathDay?: number;
  deathMonth?: number;
  deathYear?: number;
  birthDay?: number;
  birthMonth?: number;
  birthYear?: number;
  cemeteryId?: string;
  confirmInvalidDate?: boolean;
  graveLocation?: CreateGraveLocationDto;
  deceasedSubscription: CreateDeceasedSubscriptionDto;

  static readonly schema = Type.Object(
    {
      firstName: Type.Optional(StandardStringPattern),
      lastName: Type.Optional(StandardStringPattern),
      middleName: Type.Optional(StandardStringPattern),
      gender: Type.Enum(EUserGender),
      deathDay: Type.Optional(DayPattern),
      deathMonth: Type.Optional(MonthPattern),
      deathYear: Type.Optional(YearPattern),
      birthDay: Type.Optional(DayPattern),
      birthMonth: Type.Optional(MonthPattern),
      birthYear: Type.Optional(YearPattern),
      cemeteryId: Type.Optional(UUIDPattern),
      confirmInvalidDate: Type.Optional(Type.Boolean()),
      graveLocation: Type.Optional(CreateGraveLocationDto.schema),
      deceasedSubscription: CreateDeceasedSubscriptionDto.schema,
    },
    { additionalProperties: false },
  );

  static validate(data: CreateDeceasedProfileDto): void {
    if (data.graveLocation && !data.cemeteryId) {
      throw new BadRequestException('Cannot create grave location without cemetery');
    }

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

import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { PasswordPattern } from 'src/common/validators';

export class UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;

  static readonly schema = Type.Object(
    { oldPassword: PasswordPattern, newPassword: PasswordPattern },
    { additionalProperties: false },
  );

  static validate(data: UpdatePasswordDto): void {
    if (data.oldPassword === data.newPassword) {
      throw new BadRequestException('The new password must be different from the old password.');
    }
  }
}

import { BadRequestException } from '@nestjs/common';
import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';
import { EComplaintsType } from 'src/modules/complaint-form/common/enum';

export class CreateComplaintFormDto {
  complaintType: EComplaintsType;
  subjectUserId: string;
  message: string | null;

  static readonly schema = Type.Object(
    {
      complaintType: Type.Enum(EComplaintsType),
      subjectUserId: UUIDPattern,
      message: Type.Union([StandardStringPattern, Type.Null()]),
    },
    { additionalProperties: false },
  );

  public static validate(dto: CreateComplaintFormDto): void {
    if (dto.complaintType === EComplaintsType.OTHER && (dto.message === null || dto.message.trim() === '')) {
      throw new BadRequestException('Message is required when complaint type is other.');
    }
  }
}

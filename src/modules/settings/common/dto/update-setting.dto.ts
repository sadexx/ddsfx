import { Type } from '@sinclair/typebox';
import { StandardStringPattern, UUIDPattern } from 'src/common/validators';

export class UpdateSettingDto {
  description?: string;
  fastSearchMaxRequestsPerHour?: number;
  mobileFileKey?: string;
  mobilePreviewFileKey?: string;
  mobilePortraitFileKey?: string;
  firstPostFromFreyaId?: string;

  static readonly schema = Type.Object(
    {
      description: Type.Optional(StandardStringPattern),
      fastSearchMaxRequestsPerHour: Type.Optional(Type.Integer({ minimum: 1, maximum: 10000 })),
      mobileFileKey: Type.Optional(StandardStringPattern),
      mobilePreviewFileKey: Type.Optional(StandardStringPattern),
      mobilePortraitFileKey: Type.Optional(StandardStringPattern),
      firstPostFromFreyaId: Type.Optional(UUIDPattern),
    },
    { additionalProperties: false },
  );
}

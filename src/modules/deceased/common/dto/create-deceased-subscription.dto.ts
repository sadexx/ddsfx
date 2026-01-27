import { Type } from '@sinclair/typebox';
import { EKinshipType } from 'src/modules/deceased/common/enums';

export class CreateDeceasedSubscriptionDto {
  kinshipType: EKinshipType;

  static readonly schema = Type.Object({ kinshipType: Type.Enum(EKinshipType) }, { additionalProperties: false });
}

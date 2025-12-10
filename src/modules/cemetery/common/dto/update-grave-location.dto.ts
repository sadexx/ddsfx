import { Type } from '@sinclair/typebox';
import { AltitudePattern, LatitudePattern, LongitudePattern } from 'src/common/validators';

export class UpdateGraveLocationDto {
  latitude?: number;
  longitude?: number;
  altitude?: number;

  static readonly schema = Type.Object(
    {
      latitude: Type.Optional(LatitudePattern),
      longitude: Type.Optional(LongitudePattern),
      altitude: Type.Optional(AltitudePattern),
    },
    { additionalProperties: false },
  );
}

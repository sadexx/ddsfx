import { Type } from '@sinclair/typebox';
import { AltitudePattern, LatitudePattern, LongitudePattern } from 'src/common/validators';

export class CreateGraveLocationDto {
  latitude: number;
  longitude: number;
  altitude?: number;

  static readonly schema = Type.Object(
    {
      latitude: LatitudePattern,
      longitude: LongitudePattern,
      altitude: Type.Optional(AltitudePattern),
    },
    { additionalProperties: false },
  );
}

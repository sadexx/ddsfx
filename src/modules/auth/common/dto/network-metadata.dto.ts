import { Type } from '@sinclair/typebox';
import { LatitudePattern, LongitudePattern } from 'src/common/validators';

export class NetworkMetadataDto {
  hostname: string;
  clientIp: string;
  httpProtocol: string;
  asn: number;
  asOrganization: string;
  colo: string;
  country: string;
  city: string;
  region: string;
  postalCode: string;
  latitude: number;
  longitude: number;

  static readonly schema = Type.Object(
    {
      hostname: Type.String({ format: 'hostname', minLength: 1, maxLength: 253 }),
      clientIp: Type.Union([Type.String({ format: 'ipv4' }), Type.String({ format: 'ipv6' })], {}),
      httpProtocol: Type.String({ pattern: '^HTTP/(0\\.9|1\\.0|1\\.1|2\\.0|2|3)$' }),
      asn: Type.Integer({ minimum: 0, maximum: 4294967295 }),
      asOrganization: Type.String({ minLength: 1, maxLength: 255 }),
      colo: Type.String({
        minLength: 3,
        maxLength: 3,
        pattern: '^[A-Z]{3}$',
        description: 'CloudFlare datacenter IATA airport code',
      }),
      country: Type.String({
        minLength: 2,
        maxLength: 2,
        pattern: '^[A-Z]{2}$',
        description: 'ISO 3166-1 alpha-2 country code',
      }),
      city: Type.String({ minLength: 1, maxLength: 100 }),
      region: Type.String({ minLength: 1, maxLength: 100 }),
      postalCode: Type.String({ minLength: 1, maxLength: 20 }),
      latitude: LatitudePattern,
      longitude: LongitudePattern,
    },
    { additionalProperties: false },
  );
}

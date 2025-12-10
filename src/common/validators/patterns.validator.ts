import { Type } from '@sinclair/typebox';

export const UUIDPattern = Type.String({
  format: 'uuid',
  pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
  description: 'UUID v7',
});

export const EmailPattern = Type.String({
  format: 'email',
  minLength: 6,
  pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
});

export const PhoneNumberPattern = Type.String({
  pattern: '^\\+?[1-9]\\d{1,14}$',
  not: { pattern: '\\s' },
  description: 'E.164 international phone number format',
});

export const PasswordPattern = Type.String({
  minLength: 8,
  pattern: '^(?=.*[A-Z])(?=.*[a-z]).{8,}$',
  description: 'Password must contain at least one uppercase letter and one lowercase letter',
});

export const OtpCodePattern = Type.String({
  minLength: 6,
  maxLength: 6,
  pattern: '^[0-9]{6}$',
  description: 'OTP code must be 6 digits',
});

export const TimezonePattern = Type.String({
  minLength: 1,
  maxLength: 50,
  enum: Intl.supportedValuesOf('timeZone'),
});

export const StandardStringPattern = Type.String({
  minLength: 1,
  maxLength: 255,
});

export const LatitudePattern = Type.Number({
  minimum: -90,
  maximum: 90,
  description: 'Latitude in decimal degrees (-90 to 90)',
});

export const LongitudePattern = Type.Number({
  minimum: -180,
  maximum: 180,
  description: 'Longitude in decimal degrees (-180 to 180)',
});

export const AltitudePattern = Type.Number({
  minimum: -500,
  maximum: 9000,
  description: 'Altitude in meters (-500 to 9000)',
});

export const DayPattern = Type.Number({
  minimum: 1,
  maximum: 31,
  description: 'Day of month (1-31)',
});

export const MonthPattern = Type.Number({
  minimum: 1,
  maximum: 12,
  description: 'Month of year (1-12)',
});

export const YearPattern = Type.Number({
  minimum: 1900,
  maximum: 2100,
  description: 'Year (4 digits)',
});

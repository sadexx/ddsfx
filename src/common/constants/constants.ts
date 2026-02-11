import { EEnvironment } from 'src/common/enums';
import { envStringToBoolean } from 'src/common/utils';

/**
 ** In months
 */
export const NUMBER_OF_MONTHS_IN_HALF_YEAR: number = 6;
/**
 ** In days
 */
export const NUMBER_OF_DAYS_IN_YEAR: number = 365;
export const NUMBER_OF_DAYS_IN_MONTH: number = 30;
export const NUMBER_OF_DAYS_IN_WEEK: number = 7;

/**
 ** In hours
 */
export const NUMBER_OF_HOURS_IN_WEEK: number = 168;
export const NUMBER_OF_HOURS_IN_DAY: number = 24;
export const NUMBER_OF_HOURS_IN_HOUR: number = 1;
/**
 ** In minutes
 */
export const NUMBER_OF_MINUTES_IN_FIFTEEN_DAYS: number = 21600;
export const NUMBER_OF_MINUTES_IN_DAY: number = 1440;
export const NUMBER_OF_MINUTES_IN_HOUR: number = 60;
export const NUMBER_OF_MINUTES_IN_HALF_HOUR: number = 30;
export const NUMBER_OF_MINUTES_IN_TEN_MINUTES: number = 10;
export const NUMBER_OF_MINUTES_IN_FIVE_MINUTES: number = 5;
/**
 ** In seconds
 */
export const NUMBER_OF_SECONDS_IN_HOUR: number = 3600;
export const NUMBER_OF_SECONDS_IN_MINUTE: number = 60;
export const NUMBER_OF_SECONDS_IN_DAY =
  NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_HOUR * NUMBER_OF_HOURS_IN_DAY;
export const NUMBER_OF_SECONDS_IN_YEAR = NUMBER_OF_SECONDS_IN_DAY * NUMBER_OF_DAYS_IN_YEAR;
/**
 ** In milliseconds
 */
export const NUMBER_OF_MILLISECONDS_IN_TEN_SECONDS: number = 10000;
export const NUMBER_OF_MILLISECONDS_IN_FIVE_SECONDS: number = 5000;
export const NUMBER_OF_MILLISECONDS_IN_SECOND: number = 1000;
export const NUMBER_OF_MILLISECONDS_IN_MINUTE = NUMBER_OF_MILLISECONDS_IN_SECOND * NUMBER_OF_SECONDS_IN_MINUTE;
export const NUMBER_OF_MILLISECONDS_IN_HOUR =
  NUMBER_OF_MILLISECONDS_IN_SECOND * NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_HOUR;
export const NUMBER_OF_MILLISECONDS_IN_DAY = NUMBER_OF_SECONDS_IN_DAY * NUMBER_OF_MILLISECONDS_IN_SECOND;
/**
 ** Other
 */
export const ENVIRONMENT: EEnvironment = process.env['NODE_ENV'] as EEnvironment;
export const IS_LOCAL: boolean = ENVIRONMENT === EEnvironment.LOCAL;
export const IS_PRODUCTION: boolean = ENVIRONMENT === EEnvironment.PRODUCTION;
export const SEND_LOG_TO_LOKI: boolean = envStringToBoolean(process.env['SEND_LOG_TO_LOKI'] as string);
export const LOKI_URL: string = process.env['LOKI_URL'] as string;
export const SMTP_SECURE_PORT: number = 465;
export const API_PREFIX: string = 'v1';
export const NUMBER_BYTES_IN_KILOBYTE: number = 1024;
export const NUMBER_BYTES_IN_MEGABYTE: number = 1_048_576;
export const THIS_YEAR: number = new Date().getFullYear();

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { EnvConfig } from 'src/config/common/types';
import { LokiLogger } from 'src/libs/logger';
import { IRawMemoryDataset, ITransformedMemoryDataset } from 'src/modules/external-sync/common/interfaces';
import { EUserGender } from 'src/modules/users/common/enum';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class MemorySyncService {
  private readonly lokiLogger = new LokiLogger(MemorySyncService.name);

  constructor(private readonly configService: ConfigService) {}

  public async generateMemoryDatasets(): Promise<ITransformedMemoryDataset[]> {
    const {
      POSTGRES_EXTERNAL_HOST,
      POSTGRES_EXTERNAL_PORT,
      POSTGRES_EXTERNAL_USER,
      POSTGRES_EXTERNAL_DB,
      POSTGRES_EXTERNAL_PASSWORD,
    } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

    const pgClient = new Client({
      host: POSTGRES_EXTERNAL_HOST,
      port: POSTGRES_EXTERNAL_PORT,
      user: POSTGRES_EXTERNAL_USER,
      database: POSTGRES_EXTERNAL_DB,
      password: POSTGRES_EXTERNAL_PASSWORD,
      connectionTimeoutMillis: 5000,
    });
    await pgClient.connect();

    const rawSql: string = `SELECT * FROM public.v_sync
        LIMIT 1000`;

    const result = await pgClient.query<IRawMemoryDataset>(rawSql);
    await pgClient.end();

    const transformData: ITransformedMemoryDataset[] = [];
    let count = 0;
    let continueOnError = 0;

    for (const raw of result.rows) {
      try {
        const transformed = this.mapRawToTransformedDataset(raw);
        transformData.push(transformed);
        count = ++count;
      } catch (error) {
        continueOnError = ++continueOnError;
        this.lokiLogger.error(`Error processing raw data: ${(error as Error).message}. Raw Id: ${raw.grave_object_id}`);
        continue;
      }
    }
    this.lokiLogger.log(
      `Result: Total records: ${result.rows.length}, Transformed records: ${count}, Errors: ${continueOnError}.`,
    );

    return transformData;
  }

  private mapRawToTransformedDataset(raw: IRawMemoryDataset): ITransformedMemoryDataset {
    const requireNonEmptyString = (value: string | number | null | undefined, fieldName: string): string => {
      if (value === null || value === undefined) {
        throw new Error(`Missing required field: ${fieldName}`);
      }

      const formattedString = String(value).trim();

      if (formattedString === '') {
        throw new Error(`Required field ${fieldName} is empty`);
      }

      return formattedString;
    };

    const requireNonEmptyGender = (value: string | null | undefined, fieldName: string): EUserGender => {
      const formattedString = requireNonEmptyString(value, fieldName).toLowerCase();

      if (!Object.values(EUserGender).includes(formattedString as EUserGender)) {
        throw new Error(`Invalid value for ${fieldName}: "${formattedString}"`);
      }

      return formattedString as EUserGender;
    };

    const parseRequiredNumber = (value: string | number | null | undefined, fieldName: string): number => {
      const formattedString = requireNonEmptyString(value, fieldName);
      const formattedNumber = Number(formattedString);

      if (!Number.isFinite(formattedNumber)) {
        throw new Error(`Invalid number for ${fieldName}: "${formattedString}"`);
      }

      return formattedNumber;
    };

    const parseOptionalNumber = (value: string | null | undefined): number | null => {
      if (value === null || value === undefined) {
        return null;
      }

      const formattedString = String(value).trim();

      if (formattedString === '') {
        return null;
      }

      const formattedNumber = Number(formattedString);

      if (!Number.isFinite(formattedNumber)) {
        throw new Error(`Invalid numeric value: "${formattedString}"`);
      }

      return formattedNumber;
    };

    const parseOptionalDate = (value: string | null | undefined): Date | null => {
      if (value === null || value === undefined) {
        return null;
      }

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date value: "${value}"`);
      }

      return parsedDate;
    };

    const normalizeName = (value: string | null | undefined): string | null => {
      if (value === null || value === undefined) {
        return null;
      }

      const formattedString = String(value).trim();

      if (formattedString === '' || formattedString === '-') {
        return null;
      }

      return formattedString;
    };

    const originalId = parseRequiredNumber(raw.grave_object_id, 'grave_object_id');

    const gpsLatitude = parseRequiredNumber(raw.gps_latitude, 'gps_latitude');
    const gpsAltitude = parseRequiredNumber(raw.gps_altitude, 'gps_altitude');
    const gpsLongitude = parseRequiredNumber(raw.gps_longitude, 'gps_longitude');

    const cemeteryName = requireNonEmptyString(raw.cemetery_label, 'cemetery_label');
    const regionName = requireNonEmptyString(raw.region_label, 'region_label');
    const regionFullName = requireNonEmptyString(raw.region_label_full, 'region_label_full');
    const gender = requireNonEmptyGender(raw.gender_code, 'gender_code');

    const firstName = normalizeName(raw.first_name);
    const lastName = normalizeName(raw.last_name);
    const middleName = normalizeName(raw.middle_name);

    const birthDate = parseOptionalDate(raw.birth_date);
    const deathDate = parseOptionalDate(raw.death_date);

    const birthYear = parseOptionalNumber(raw.birth_year);
    const birthMonth = parseOptionalNumber(raw.birth_month);
    const birthDay = parseOptionalNumber(raw.birth_day);

    const deathYear = parseOptionalNumber(raw.death_year);
    const deathMonth = parseOptionalNumber(raw.death_month);
    const deathDay = parseOptionalNumber(raw.death_day);

    const filePreviewFileKey = normalizeName(raw.file_preview_file_key);
    const additionalFilePreviewFileKey = normalizeName(raw.additional_file_preview_file_key);
    const portraitFileKey = normalizeName(raw.portrait_file_key);

    const createdAt = parseOptionalDate(raw.created_at);
    const updatedAt = parseOptionalDate(raw.updated_at);

    const transformedPerson: ITransformedMemoryDataset = {
      originalId: originalId,
      gpsLatitude: gpsLatitude,
      gpsAltitude: gpsAltitude,
      gpsLongitude: gpsLongitude,
      cemeteryName: cemeteryName,
      regionName: regionName,
      regionFullName: regionFullName,
      gender: gender,
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      birthDate: birthDate,
      deathDate: deathDate,
      birthYear: birthYear,
      birthMonth: birthMonth,
      birthDay: birthDay,
      deathYear: deathYear,
      deathMonth: deathMonth,
      deathDay: deathDay,
      filePreviewFileKey: filePreviewFileKey,
      additionalFilePreviewFileKey: additionalFilePreviewFileKey,
      portraitFileKey: portraitFileKey,
      memoryCreationDate: createdAt,
      memoryUpdatingDate: updatedAt,
    };

    return transformedPerson;
  }
}

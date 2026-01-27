import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js';
import { Bulk_RequestBody, Indices_Create_Request } from '@opensearch-project/opensearch/api/index.js';
import { Client } from 'pg';
import { generateUuidV7 } from 'src/common/utils';
import { EnvConfig } from 'src/config/common/types';
import { LokiLogger } from 'src/libs/logger';
import { EOpenSearchIndexType } from 'src/libs/opensearch/common/enums';
import { OpenSearchService } from 'src/libs/opensearch/services';
import {
  IRawPerson,
  ITransformedDeceasedSubscription,
  ITransformedPerson,
} from 'src/modules/external-sync/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import { Repository } from 'typeorm';
import { ESortOrder } from 'src/common/enums';

@Injectable()
export class ExternalSyncService {
  private readonly lokiLogger = new LokiLogger(ExternalSyncService.name);

  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    private readonly configService: ConfigService<EnvConfig>,
    private readonly searchService: OpenSearchService,
  ) {}

  public async seedData(): Promise<void> {
    await this.initializePeopleIndex();

    const count = await this.searchService.count({ index: EOpenSearchIndexType.PEOPLE });

    if (count.count > 0) {
      this.lokiLogger.log(`Index ${EOpenSearchIndexType.PEOPLE} already contains ${count.count} documents`);

      return;
    }

    await this.seedMemoryData();
    await this.seedCityData();
  }

  private async initializePeopleIndex(): Promise<void> {
    const keywordProperty: Property = { type: 'keyword', normalizer: 'lowercase_normalizer' };
    const floatProperty: Property = { type: 'float' };
    const integerProperty: Property = { type: 'integer' };
    const dateProperty: Property = { type: 'date' };
    const ngram: Property = { type: 'text', analyzer: 'name_ngram_analyzer', search_analyzer: 'name_search_analyzer' };

    const indexConfig: Indices_Create_Request = {
      index: EOpenSearchIndexType.PEOPLE,
      body: {
        mappings: {
          properties: {
            id: keywordProperty,
            originalId: integerProperty,
            gpsLatitude: floatProperty,
            gpsAltitude: floatProperty,
            gpsLongitude: floatProperty,
            cemeteryLabel: keywordProperty,
            regionLabel: keywordProperty,
            regionLabelFull: keywordProperty,
            genderCode: keywordProperty,
            firstName: {
              type: 'text',
              analyzer: 'cyrillic_analyzer',
              fields: { keyword: keywordProperty, ngram: ngram },
            },
            lastName: {
              type: 'text',
              analyzer: 'cyrillic_analyzer',
              fields: { keyword: keywordProperty, ngram: ngram },
            },
            middleName: {
              type: 'text',
              analyzer: 'cyrillic_analyzer',
              fields: { keyword: keywordProperty, ngram: ngram },
            },
            fullName: {
              type: 'text',
              analyzer: 'cyrillic_analyzer',
              fields: { ngram: ngram },
            },
            birthDate: dateProperty,
            deathDate: dateProperty,
            birthYear: integerProperty,
            birthMonth: integerProperty,
            birthDay: integerProperty,
            deathYear: integerProperty,
            deathMonth: integerProperty,
            deathDay: integerProperty,
            fileKey: keywordProperty,
            deceasedSubscriptions: {
              type: 'nested',
              properties: {
                id: keywordProperty,
              },
            },
          },
        },
        settings: {
          analysis: {
            normalizer: {
              lowercase_normalizer: { type: 'custom', filter: ['lowercase'] },
            },
            filter: {
              russian_stop: { type: 'stop', stopwords: '_russian_' },
              name_ngram_filter: { type: 'ngram', min_gram: 2, max_gram: 10 },
            },
            analyzer: {
              cyrillic_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'russian_stop'],
              },
              name_ngram_analyzer: {
                type: 'custom',
                tokenizer: 'keyword',
                filter: ['lowercase', 'name_ngram_filter'],
              },
              name_search_analyzer: {
                type: 'custom',
                tokenizer: 'keyword',
                filter: ['lowercase'],
              },
            },
          },
          index: {
            max_ngram_diff: 10,
          },
        },
      },
    };

    await this.searchService.createIndex(indexConfig);
  }

  private async seedMemoryData(): Promise<void> {
    try {
      this.lokiLogger.log('Seeding people data from memory...');

      const people = await this.generateMemoryDatasets();
      await this.bulkIndexPeople(people);
      this.lokiLogger.log(`Successfully seeded ${people.length} people records from memory`);
    } catch (error) {
      this.lokiLogger.error('Failed to seed people data from memory:', (error as Error).message);
      throw error;
    }
  }

  private async seedCityData(): Promise<void> {
    try {
      this.lokiLogger.log('Seeding people data from city...');

      const people = await this.generateCityDatasets();
      await this.bulkIndexPeople(people);
      this.lokiLogger.log(`Successfully seeded ${people.length} people records from city`);
    } catch (error) {
      this.lokiLogger.error('Failed to seed people data from city:', (error as Error).message);
      throw error;
    }
  }

  private async generateMemoryDatasets(): Promise<ITransformedPerson[]> {
    const pgClient = new Client({
      connectionString: this.configService.getOrThrow<string>('POSTGRES_EXTERNAL_DB_URL'),
    });
    await pgClient.connect();

    const rawSql: string = `
    SELECT public.files.id AS file_id,
          public.files.status_code,
          public.files.gps_latitude,
          public.files.gps_altitude,
          public.files.gps_longitude,
          public.cemetery.label AS cemetery_label,
          public.regions.label AS region_label,
          public.regions.label_full AS region_label_full,
          public.grave_object.first_name,
          public.grave_object.last_name,
          public.grave_object.middle_name,
          public.grave_object.gender_code,
          public.grave_object.birth_date,
          public.grave_object.death_date,
          public.grave_object.birth_year,
          public.grave_object.birth_month,
          public.grave_object.birth_day,
          public.grave_object.death_year,
          public.grave_object.death_month,
          public.grave_object.death_day,
          public.additional_files.file_key
    FROM public.files
    LEFT JOIN public.cemetery
      ON public.files.cemetery_id = public.cemetery.id
    LEFT JOIN public.regions
      ON public.cemetery.region_id = public.regions.id
    LEFT JOIN public.grave_object
      ON public.files.id = public.grave_object.file_id
    LEFT JOIN public.additional_files
      ON public.grave_object.additional_file_id = public.additional_files.id
    WHERE public.files.status_code = 'verified'
    LIMIT 10000;`;

    const result = await pgClient.query<IRawPerson>(rawSql);
    await pgClient.end();

    const transformData: ITransformedPerson[] = [];
    let count = 0;
    let continueOnError = 0;

    for (const raw of result.rows) {
      try {
        const transformed = this.mapRawToTransformedPerson(raw);
        transformData.push(transformed);
        count = ++count;
      } catch (error) {
        continueOnError = ++continueOnError;
        this.lokiLogger.error(`Error processing raw data: ${(error as Error).message}`);
        continue;
      }
    }
    this.lokiLogger.log(
      `Result: Total records: ${result.rows.length}, Transformed records: ${count}, Errors: ${continueOnError}.`,
    );

    return transformData;
  }

  private mapRawToTransformedPerson(raw: IRawPerson): ITransformedPerson {
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

    const originalId = parseRequiredNumber(raw.file_id, 'file_id');

    const gpsLatitude = parseRequiredNumber(raw.gps_latitude, 'gps_latitude');
    const gpsAltitude = parseRequiredNumber(raw.gps_altitude, 'gps_altitude');
    const gpsLongitude = parseRequiredNumber(raw.gps_longitude, 'gps_longitude');

    const cemeteryLabel = requireNonEmptyString(raw.cemetery_label, 'cemetery_label');
    const regionLabel = requireNonEmptyString(raw.region_label, 'region_label');
    const regionLabelFull = requireNonEmptyString(raw.region_label_full, 'region_label_full');
    const genderCode = requireNonEmptyString(raw.gender_code, 'gender_code');

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

    const fileKey = normalizeName(raw.file_key);

    const transformedPerson: ITransformedPerson = {
      id: generateUuidV7(),
      originalId: originalId,
      gpsLatitude: gpsLatitude,
      gpsAltitude: gpsAltitude,
      gpsLongitude: gpsLongitude,
      cemeteryLabel: cemeteryLabel,
      regionLabel: regionLabel,
      regionLabelFull: regionLabelFull,
      genderCode: genderCode,
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
      fileKey: fileKey,
      deceasedSubscriptions: [],
    };

    return transformedPerson;
  }

  public async generateCityDatasets(): Promise<ITransformedPerson[]> {
    const MAX_SUBSCRIPTIONS_PREVIEW = 3;

    const deceased = await this.deceasedRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        birthDay: true,
        birthMonth: true,
        birthYear: true,
        birthDate: true,
        deathDay: true,
        deathMonth: true,
        deathYear: true,
        deathDate: true,
        graveLocation: {
          id: true,
          latitude: true,
          longitude: true,
          altitude: true,
          cemetery: { id: true, name: true, address: { id: true, region: true } },
        },
        deceasedSubscriptions: { id: true, creationDate: true },
        deceasedMediaContents: { id: true, isPrimary: true, memoryFileKey: true, file: { fileKey: true } },
      },
      relations: {
        graveLocation: { cemetery: { address: true } },
        deceasedSubscriptions: true,
        deceasedMediaContents: { file: true },
      },
      order: { deceasedSubscriptions: { creationDate: ESortOrder.DESC } },
    });

    const transformedData: ITransformedPerson[] = [];
    for (const deceasedRow of deceased) {
      const { graveLocation, deceasedSubscriptions, deceasedMediaContents } = deceasedRow;
      const subscriptions: ITransformedDeceasedSubscription[] = deceasedSubscriptions
        .slice(0, MAX_SUBSCRIPTIONS_PREVIEW)
        .map((subscription) => ({
          id: subscription.id,
        }));
      const primaryMedia = deceasedMediaContents.find((mediaContent) => mediaContent.isPrimary);

      const transformedPerson: ITransformedPerson = {
        id: deceasedRow.id,
        originalId: null,
        gpsLatitude: graveLocation?.latitude ?? null,
        gpsAltitude: graveLocation?.altitude ?? null,
        gpsLongitude: graveLocation?.longitude ?? null,
        cemeteryLabel: graveLocation?.cemetery.name ?? null,
        regionLabel: graveLocation?.cemetery?.address?.region ?? null,
        regionLabelFull: graveLocation?.cemetery?.address?.region ?? null,
        genderCode: null,
        firstName: deceasedRow.firstName,
        lastName: deceasedRow.lastName,
        middleName: deceasedRow.middleName,
        birthDate: deceasedRow.birthDate,
        deathDate: deceasedRow.deathDate,
        birthYear: deceasedRow.birthYear,
        birthMonth: deceasedRow.birthMonth,
        birthDay: deceasedRow.birthDay,
        deathYear: deceasedRow.deathYear,
        deathMonth: deceasedRow.deathMonth,
        deathDay: deceasedRow.deathDay,
        fileKey: primaryMedia?.memoryFileKey ?? primaryMedia?.file?.fileKey ?? null,
        deceasedSubscriptions: subscriptions,
      };
      transformedData.push(transformedPerson);
    }

    return transformedData;
  }

  private async bulkIndexPeople(transformedData: ITransformedPerson[]): Promise<void> {
    if (transformedData.length === 0) {
      return;
    }

    const bulkBody: Bulk_RequestBody = transformedData.flatMap((person) => [
      { index: { _index: EOpenSearchIndexType.PEOPLE, _id: person.id } },
      {
        ...person,
        fullName: `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim(),
      },
    ]);

    await this.searchService.bulk({ body: bulkBody });
  }
}

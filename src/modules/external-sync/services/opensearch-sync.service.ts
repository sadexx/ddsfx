import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js';
import { Bulk_RequestBody, Indices_Create_Request } from '@opensearch-project/opensearch/api/index.js';
import { EOpenSearchIndexType } from 'src/libs/opensearch/common/enums';
import { OpenSearchService } from 'src/libs/opensearch/services';
import { Deceased } from 'src/modules/deceased/entities';
import { PersonSchema } from 'src/modules/search-engine-logic/schemas';
import { EBucketName } from 'src/libs/file-management/common/enums';
import { TLoadDeceasedWithRelations } from 'src/modules/external-sync/common/types';
import { findOneOrFailQueryBuilderTyped } from 'src/common/utils/find-one-typed';
import { ExternalSyncQueryOptionsService } from 'src/modules/external-sync/services/external-sync-query-options.service';
import { findManyQueryBuilderTyped } from 'src/common/utils/find-many-typed';
import { EDeceasedStatus } from 'src/modules/deceased/common/enums';

@Injectable()
export class OpenSearchSyncService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    private readonly openSearchService: OpenSearchService,
    private readonly externalSyncQueryOptionsService: ExternalSyncQueryOptionsService,
  ) {}

  public async initializePeopleIndex(): Promise<void> {
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
            cemeteryName: keywordProperty,
            regionName: keywordProperty,
            regionFullName: keywordProperty,
            gender: keywordProperty,
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
            portraitFileKey: keywordProperty,
            deceasedSubscriptions: {
              type: 'nested',
              properties: {
                id: keywordProperty,
                fileKey: keywordProperty,
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

    await this.openSearchService.createIndex(indexConfig);
  }

  public async generateCityDatasets(): Promise<PersonSchema[]> {
    const queryBuilder = this.deceasedRepository.createQueryBuilder('deceased');
    this.externalSyncQueryOptionsService.loadDeceasedWithRelationsOptions(queryBuilder);

    const deceased = await findManyQueryBuilderTyped<TLoadDeceasedWithRelations[]>(queryBuilder);

    const transformedData: PersonSchema[] = [];
    for (const deceasedRow of deceased) {
      const transformedPerson = this.mapDeceasedToSearchDocument(deceasedRow);
      transformedData.push(transformedPerson);
    }

    return transformedData;
  }

  public async bulkIndexPeople(transformedData: PersonSchema[]): Promise<void> {
    if (transformedData.length === 0) {
      return;
    }

    const bulkBody: Bulk_RequestBody = transformedData.flatMap((person) => [
      { index: { _index: EOpenSearchIndexType.PEOPLE, _id: person.id } },
      { ...person },
    ]);

    await this.openSearchService.bulk({ body: bulkBody });
  }

  public async countDocumentsInOpenSearch(): Promise<number> {
    const count = await this.openSearchService.count({ index: EOpenSearchIndexType.PEOPLE });

    return count.count;
  }

  public async updateDeceasedIndex(deceased: { id: string; status: EDeceasedStatus }): Promise<void> {
    if (deceased.status !== EDeceasedStatus.VERIFIED) {
      return;
    }

    const deceasedWithRelations = await this.loadDeceasedWithRelations(deceased.id);
    const document = this.mapDeceasedToSearchDocument(deceasedWithRelations);

    await this.openSearchService.update({
      index: EOpenSearchIndexType.PEOPLE,
      id: deceased.id,
      body: {
        doc: {
          ...document,
        },
      },
    });
  }

  private async loadDeceasedWithRelations(deceasedId: string): Promise<TLoadDeceasedWithRelations> {
    const queryBuilder = this.deceasedRepository.createQueryBuilder('deceased');
    this.externalSyncQueryOptionsService.loadDeceasedWithRelationsOptions(queryBuilder, deceasedId);
    const deceased = await findOneOrFailQueryBuilderTyped<TLoadDeceasedWithRelations>(
      deceasedId,
      queryBuilder,
      Deceased.options.name,
    );

    return deceased;
  }

  public async deleteOpenSearchIndex(): Promise<void> {
    await this.openSearchService.deleteIndex(EOpenSearchIndexType.PEOPLE);
  }

  private mapDeceasedToSearchDocument(deceased: TLoadDeceasedWithRelations): PersonSchema {
    const { graveLocation, deceasedSubscriptions, deceasedMediaContents } = deceased;
    const subscriptions = deceasedSubscriptions.map((subscription) => ({
      id: subscription.id,
      fileKey: subscription.user.avatar?.file.fileKey ?? null,
    }));

    const cityMediaFile = deceasedMediaContents.find(
      (mediaContent) => mediaContent.file.bucketName !== EBucketName.FREYA_MEMORY,
    );
    const memoryMediaFile = deceasedMediaContents.find(
      (mediaContent) => mediaContent.file.bucketName === EBucketName.FREYA_MEMORY,
    );

    const transformedPerson: PersonSchema = {
      id: deceased.id,
      originalId: deceased.originalId,
      gpsLatitude: graveLocation?.latitude ?? null,
      gpsAltitude: graveLocation?.altitude ?? null,
      gpsLongitude: graveLocation?.longitude ?? null,
      cemeteryName: graveLocation?.cemetery.name ?? null,
      regionName: graveLocation?.cemetery?.address?.region ?? null,
      regionFullName: graveLocation?.cemetery?.address?.region ?? null,
      gender: deceased.gender,
      firstName: deceased.firstName,
      lastName: deceased.lastName,
      middleName: deceased.middleName,
      fullName: `${deceased.lastName} ${deceased.firstName} ${deceased.middleName || ''}`.trim(),
      birthDate: deceased.birthDate,
      deathDate: deceased.deathDate,
      birthYear: deceased.birthYear,
      birthMonth: deceased.birthMonth,
      birthDay: deceased.birthDay,
      deathYear: deceased.deathYear,
      deathMonth: deceased.deathMonth,
      deathDay: deceased.deathDay,
      fileKey: cityMediaFile?.file.fileKey ?? null,
      portraitFileKey: memoryMediaFile?.file.fileKey ?? null,
      deceasedSubscriptions: subscriptions,
    };

    return transformedPerson;
  }
}

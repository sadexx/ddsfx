import { Injectable, NotFoundException } from '@nestjs/common';
import { ITransformedDeceasedSubscription, ITransformedPerson } from 'src/modules/external-sync/common/interfaces';
import { Deceased, DeceasedMediaContent } from 'src/modules/deceased/entities';
import { DeceasedQueryOptionsService } from 'src/modules/deceased/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TLoadDeceasedWithRelations } from 'src/modules/deceased/common/types';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { OpenSearchService } from 'src/libs/opensearch/services';
import { EOpenSearchIndexType } from 'src/libs/opensearch/common/enums';
import { PersonSchema } from 'src/modules/search-engine-logic/schemas';
import { IDeceased } from 'src/modules/deceased/common/interfaces';
import { EDeceasedMediaContentType, EDeceasedStatus } from 'src/modules/deceased/common/enums';
import { Cemetery, GraveLocation } from 'src/modules/cemetery/entities';

@Injectable()
export class DeceasedSyncService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    private readonly deceasedQueryOptionsService: DeceasedQueryOptionsService,
    private readonly searchService: OpenSearchService,
    private readonly dataSource: DataSource,
  ) {}

  public async indexDeceased(deceasedId: string): Promise<void> {
    const deceased = await this.loadDeceasedWithRelations(deceasedId);
    const document = this.mapDeceasedToSearchDocument(deceased);

    await this.searchService.addDocumentToIndex(EOpenSearchIndexType.PEOPLE, document.id, {
      ...document,
      fullName: `${document.lastName} ${document.firstName} ${document.middleName || ''}`.trim(),
    });
  }

  public async updateDeceasedIndex(deceasedId: string): Promise<void> {
    const deceased = await this.loadDeceasedWithRelations(deceasedId);
    const document = this.mapDeceasedToSearchDocument(deceased);

    await this.searchService.update({
      index: EOpenSearchIndexType.PEOPLE,
      id: deceasedId,
      body: {
        doc: {
          ...document,
          fullName: `${document.lastName || ''} ${document.firstName || ''} ${document.middleName || ''}`.trim(),
        },
      },
    });
  }

  public async createDeceasedFromIndex(deceasedId: string): Promise<Deceased> {
    const person = await this.getDeceasedIndex(deceasedId);

    return await this.dataSource.transaction(async (manager) => {
      return await this.constructAndCreateDeceasedFromIndex(manager, person);
    });
  }

  private async getDeceasedIndex(deceasedId: string): Promise<PersonSchema> {
    const result = await this.searchService.search({
      index: EOpenSearchIndexType.PEOPLE,
      body: { query: { term: { id: deceasedId } }, size: 1 },
    });

    if (!result.hits.hits.length || !result.hits.hits[0]) {
      throw new NotFoundException(`Deceased not found with specified field: id, value: ${deceasedId}`);
    }

    const [firstHit] = result.hits.hits;
    const source = firstHit._source as PersonSchema;

    return source;
  }

  private async loadDeceasedWithRelations(deceasedId: string): Promise<TLoadDeceasedWithRelations> {
    const queryOptions = this.deceasedQueryOptionsService.loadDeceasedWithRelationsOptions(deceasedId);
    const deceased = await findOneOrFailTyped<TLoadDeceasedWithRelations>(
      deceasedId,
      this.deceasedRepository,
      queryOptions,
    );

    return deceased;
  }

  private async constructAndCreateDeceasedFromIndex(manager: EntityManager, person: PersonSchema): Promise<Deceased> {
    const deceasedDto = this.mapSearchDocumentToDeceased(person);
    const savedDeceased = await manager.getRepository(Deceased).save({ ...deceasedDto, id: person.id });

    if (person.cemeteryLabel) {
      await this.createGraveLocationFromIndex(manager, person, savedDeceased);
    }

    if (person.fileKey) {
      await manager.getRepository(DeceasedMediaContent).save({
        contentType: EDeceasedMediaContentType.MEMORY_PHOTO,
        memoryFileKey: person.fileKey,
        isPrimary: true,
        deceased: savedDeceased,
      });
    }

    return savedDeceased;
  }

  private async createGraveLocationFromIndex(
    manager: EntityManager,
    person: PersonSchema,
    deceased: Deceased,
  ): Promise<void> {
    let cemetery = await manager.getRepository(Cemetery).findOne({
      where: { name: ILike(`%${person.cemeteryLabel}%`) },
    });

    if (!cemetery) {
      cemetery = await manager.getRepository(Cemetery).save({ name: person.cemeteryLabel ?? undefined });
    }

    await manager.getRepository(GraveLocation).save({
      longitude: person.gpsLongitude,
      latitude: person.gpsLatitude,
      altitude: person.gpsAltitude,
      deceased,
      cemetery,
    });
  }

  private mapDeceasedToSearchDocument(deceased: TLoadDeceasedWithRelations): ITransformedPerson {
    const MAX_SUBSCRIPTIONS_PREVIEW = 3;

    const { graveLocation, deceasedSubscriptions, deceasedMediaContents } = deceased;
    const subscriptions: ITransformedDeceasedSubscription[] = deceasedSubscriptions
      .slice(0, MAX_SUBSCRIPTIONS_PREVIEW)
      .map((subscription) => ({
        id: subscription.id,
      }));
    const primaryMedia = deceasedMediaContents.find((mediaContent) => mediaContent.isPrimary);

    return {
      id: deceased.id,
      originalId: null,
      gpsLatitude: graveLocation?.latitude ?? null,
      gpsAltitude: graveLocation?.altitude ?? null,
      gpsLongitude: graveLocation?.longitude ?? null,
      cemeteryLabel: graveLocation?.cemetery?.name ?? null,
      regionLabel: graveLocation?.cemetery?.address?.region ?? null,
      regionLabelFull: graveLocation?.cemetery?.address?.region ?? null,
      genderCode: null,
      firstName: deceased.firstName,
      lastName: deceased.lastName,
      middleName: deceased.middleName,
      birthDate: deceased.birthDate,
      deathDate: deceased.deathDate,
      birthYear: deceased.birthYear,
      birthMonth: deceased.birthMonth,
      birthDay: deceased.birthDay,
      deathYear: deceased.deathYear,
      deathMonth: deceased.deathMonth,
      deathDay: deceased.deathDay,
      fileKey: primaryMedia?.memoryFileKey ?? primaryMedia?.file?.fileKey ?? null,
      deceasedSubscriptions: subscriptions,
    };
  }

  private mapSearchDocumentToDeceased(person: PersonSchema): IDeceased {
    return {
      status: EDeceasedStatus.VERIFIED,
      originalId: person.originalId,
      firstName: person.firstName,
      lastName: person.lastName,
      middleName: person.middleName,
      deathDay: person.deathDay,
      deathMonth: person.deathMonth,
      deathYear: person.deathYear,
      deathDate: person.deathDate,
      birthDay: person.birthDay,
      birthMonth: person.birthMonth,
      birthYear: person.birthYear,
      birthDate: person.birthDate,
    };
  }
}

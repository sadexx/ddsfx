import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, In, SelectQueryBuilder } from 'typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import {
  CreateDeceasedBiographyQuery,
  CreateDeceasedSocialMediaLinkQuery,
  GetDeceasedBiographiesQuery,
  GetDeceasedEducationsQuery,
  GetDeceasedResidencesQuery,
  GetDeceasedSocialMediaLinksQuery,
  RemoveDeceasedBiographyQuery,
  RemoveDeceasedEducationQuery,
  RemoveDeceasedResidenceQuery,
  RemoveDeceasedSocialMediaLinkQuery,
  UpdateDeceasedBiographyQuery,
  UpdateDeceasedEducationQuery,
  UpdateDeceasedResidenceQuery,
  UpdateDeceasedSocialMediaLinkQuery,
} from 'src/modules/deceased-highlights/common/types';
import {
  DeceasedBiography,
  DeceasedPlaceEntry,
  DeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/entities';
import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';

@Injectable()
export class DeceasedHighLightsQueryOptionsService {
  /**
   ** DeceasedResidenceService
   */

  public getDeceasedResidencesOptions(deceasedId: string): FindManyOptions<DeceasedPlaceEntry> {
    return {
      select: GetDeceasedResidencesQuery.select,
      where: { type: EDeceasedPlaceEntryType.RESIDENCE, deceased: { id: deceasedId } },
      relations: GetDeceasedResidencesQuery.relations,
    };
  }

  public createDeceasedResidencesOptions(queryBuilder: SelectQueryBuilder<Deceased>, deceasedId: string): void {
    queryBuilder
      .select('deceased.id')
      .leftJoin('deceased.deceasedPlaceEntries', 'deceasedPlaceEntry', 'deceasedPlaceEntry.type = :type', {
        type: EDeceasedPlaceEntryType.RESIDENCE,
      })
      .addSelect('deceasedPlaceEntry.id')
      .where('deceased.id = :deceasedId', { deceasedId });
  }

  public updateDeceasedResidenceOptions(deceasedResidenceId: string): FindOneOptions<DeceasedPlaceEntry> {
    return {
      select: UpdateDeceasedResidenceQuery.select,
      where: { id: deceasedResidenceId, type: EDeceasedPlaceEntryType.RESIDENCE },
      relations: UpdateDeceasedResidenceQuery.relations,
    };
  }

  public removeDeceasedResidenceOptions(deceasedResidenceId: string): FindOneOptions<DeceasedPlaceEntry> {
    return {
      select: RemoveDeceasedResidenceQuery.select,
      where: { id: deceasedResidenceId, type: EDeceasedPlaceEntryType.RESIDENCE },
      relations: RemoveDeceasedResidenceQuery.relations,
    };
  }

  /**
   ** DeceasedEducationService
   */

  public getDeceasedEducationsOptions(deceasedId: string): FindManyOptions<DeceasedPlaceEntry> {
    return {
      select: GetDeceasedEducationsQuery.select,
      where: {
        type: In([EDeceasedPlaceEntryType.SECONDARY_EDUCATION, EDeceasedPlaceEntryType.HIGHER_EDUCATION]),
        deceased: { id: deceasedId },
      },
      relations: GetDeceasedEducationsQuery.relations,
    };
  }

  public createDeceasedEducationsOptions(queryBuilder: SelectQueryBuilder<Deceased>, deceasedId: string): void {
    queryBuilder
      .select('deceased.id')
      .leftJoin('deceased.deceasedPlaceEntries', 'deceasedPlaceEntry', 'deceasedPlaceEntry.type IN (:...types)', {
        types: [EDeceasedPlaceEntryType.SECONDARY_EDUCATION, EDeceasedPlaceEntryType.HIGHER_EDUCATION],
      })
      .addSelect('deceasedPlaceEntry.id')
      .where('deceased.id = :deceasedId', { deceasedId });
  }

  public updateDeceasedEducationOptions(deceasedEducationId: string): FindManyOptions<DeceasedPlaceEntry> {
    return {
      select: UpdateDeceasedEducationQuery.select,
      where: {
        id: deceasedEducationId,
        type: In([EDeceasedPlaceEntryType.SECONDARY_EDUCATION, EDeceasedPlaceEntryType.HIGHER_EDUCATION]),
      },
      relations: UpdateDeceasedEducationQuery.relations,
    };
  }

  public removeDeceasedEducationOptions(deceasedEducationId: string): FindOneOptions<DeceasedPlaceEntry> {
    return {
      select: RemoveDeceasedEducationQuery.select,
      where: {
        id: deceasedEducationId,
        type: In([EDeceasedPlaceEntryType.SECONDARY_EDUCATION, EDeceasedPlaceEntryType.HIGHER_EDUCATION]),
      },
      relations: RemoveDeceasedEducationQuery.relations,
    };
  }

  /**
   ** DeceasedBiographyService
   */

  public getDeceasedBiographiesOptions(deceasedId: string): FindManyOptions<DeceasedBiography> {
    return {
      select: GetDeceasedBiographiesQuery.select,
      where: { deceased: { id: deceasedId } },
      relations: GetDeceasedBiographiesQuery.relations,
    };
  }

  public createDeceasedBiographyOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedBiographyQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedBiographyQuery.relations,
    };
  }

  public updateDeceasedBiographyOptions(deceasedBiographyId: string): FindOneOptions<DeceasedBiography> {
    return {
      select: UpdateDeceasedBiographyQuery.select,
      where: { id: deceasedBiographyId },
      relations: UpdateDeceasedBiographyQuery.relations,
    };
  }

  public removeDeceasedBiographyOptions(deceasedBiographyId: string): FindOneOptions<DeceasedBiography> {
    return {
      select: RemoveDeceasedBiographyQuery.select,
      where: { id: deceasedBiographyId },
      relations: RemoveDeceasedBiographyQuery.relations,
    };
  }

  /**
   ** DeceasedSocialMediaLinkService
   */

  public getDeceasedSocialMediaLinksOptions(deceasedId: string): FindManyOptions<DeceasedSocialMediaLink> {
    return {
      select: GetDeceasedSocialMediaLinksQuery.select,
      where: { deceased: { id: deceasedId } },
      relations: GetDeceasedSocialMediaLinksQuery.relations,
    };
  }

  public createDeceasedSocialMediaLinkOptions(deceasedId: string): FindOneOptions<Deceased> {
    return {
      select: CreateDeceasedSocialMediaLinkQuery.select,
      where: { id: deceasedId },
      relations: CreateDeceasedSocialMediaLinkQuery.relations,
    };
  }

  public updateDeceasedSocialMediaLinkOptions(
    deceasedSocialMediaLinkId: string,
  ): FindOneOptions<DeceasedSocialMediaLink> {
    return {
      select: UpdateDeceasedSocialMediaLinkQuery.select,
      where: { id: deceasedSocialMediaLinkId },
      relations: UpdateDeceasedSocialMediaLinkQuery.relations,
    };
  }

  public removeDeceasedSocialMediaLinkOptions(
    deceasedSocialMediaLinkId: string,
  ): FindOneOptions<DeceasedSocialMediaLink> {
    return {
      select: RemoveDeceasedSocialMediaLinkQuery.select,
      where: { id: deceasedSocialMediaLinkId },
      relations: RemoveDeceasedSocialMediaLinkQuery.relations,
    };
  }

  /**
   ** DeceasedHighlightsValidationService
   */

  public validateCreateDeceasedResidencesOptions(deceasedId: string): FindOneOptions<DeceasedPlaceEntry> {
    return {
      where: {
        type: EDeceasedPlaceEntryType.RESIDENCE,
        deceased: { id: deceasedId },
        isBirthPlace: true,
      },
    };
  }
}

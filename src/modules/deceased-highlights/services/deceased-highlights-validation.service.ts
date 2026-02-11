import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateDeceasedEducationsDto,
  CreateDeceasedResidencesDto,
  CreateDeceasedSocialMediaLinkDto,
  UpdateDeceasedEducationDto,
  UpdateDeceasedResidenceDto,
  UpdateDeceasedSocialMediaLinkDto,
} from 'src/modules/deceased-highlights/common/dto';
import {
  TCreateDeceasedBiography,
  TCreateDeceasedEducations,
  TCreateDeceasedResidences,
  TCreateDeceasedSocialMediaLink,
  TUpdateDeceasedEducation,
  TUpdateDeceasedResidence,
  TUpdateDeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/common/types';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';
import { DeceasedHighLightsQueryOptionsService } from 'src/modules/deceased-highlights/services';
import { SOCIAL_MEDIA_LINK_PATTERNS } from 'src/modules/deceased-highlights/common/constants';
import { HelperService } from 'src/modules/helper/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class DeceasedHighlightsValidationService {
  private readonly HIGHLIGHTS_LIMIT: number = 20;
  constructor(
    @InjectRepository(DeceasedPlaceEntry)
    private readonly deceasedPlaceEntryRepository: Repository<DeceasedPlaceEntry>,
    private readonly deceasedHighLightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly helperService: HelperService,
  ) {}

  /**
   ** DeceasedResidenceService
   */

  public async validateCreateDeceasedResidences(
    dto: CreateDeceasedResidencesDto,
    deceased: TCreateDeceasedResidences,
  ): Promise<void> {
    this.validateEntitiesLimit(deceased.deceasedPlaceEntries, dto.residences.length);

    const referenceIds = dto.residences.flatMap((residence) => [residence.cityId]);
    await this.helperService.ensureReferencesExist(referenceIds);

    const hasNewBirthPlace = dto.residences.some((residence) => residence.isBirthPlace);

    if (hasNewBirthPlace) {
      await this.validateBirthplaceConstraint(deceased.id);
    }
  }

  public async validateUpdateDeceasedResidence(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedResidence,
  ): Promise<void> {
    this.validateEntityYearRange(existingDeceasedResidence, dto.startYear, dto.endYear);

    if (dto.isBirthPlace === true && existingDeceasedResidence.isBirthPlace === false) {
      await this.validateBirthplaceConstraint(existingDeceasedResidence.deceased.id);
    }

    if (dto.cityId) {
      await this.helperService.ensureReferencesExist([dto.cityId]);
    }
  }

  private async validateBirthplaceConstraint(deceasedId: string): Promise<void> {
    const queryOptions = this.deceasedHighLightsQueryOptionsService.validateCreateDeceasedResidencesOptions(deceasedId);
    const existingBirthPlace = await this.deceasedPlaceEntryRepository.exists(queryOptions);

    if (existingBirthPlace) {
      throw new BadRequestException('Only one deceased residence can be marked as birthplace');
    }
  }

  /**
   ** DeceasedEducationService
   */

  public async validateCreateDeceasedEducations(
    dto: CreateDeceasedEducationsDto,
    deceased: TCreateDeceasedEducations,
  ): Promise<void> {
    this.validateEntitiesLimit(deceased.deceasedPlaceEntries, dto.educations.length);

    const referenceIds = dto.educations
      .flatMap((education) => [education.institutionNameId, education.specializationId])
      .filter((id) => id !== undefined);
    await this.helperService.ensureReferencesExist(referenceIds);
  }

  public async validateUpdateDeceasedEducation(
    dto: UpdateDeceasedEducationDto,
    existingDeceasedResidence: TUpdateDeceasedEducation,
  ): Promise<void> {
    this.validateEntityYearRange(existingDeceasedResidence, dto.startYear, dto.endYear);

    const referenceIds = [dto.institutionNameId, dto.specializationId].filter(
      (id): id is string => id !== undefined && id !== null,
    );

    if (referenceIds.length !== 0) {
      await this.helperService.ensureReferencesExist(referenceIds);
    }
  }

  /**
   ** DeceasedBiographyService
   */

  public validateCreateDeceasedBiography(deceased: TCreateDeceasedBiography): void {
    this.validateEntitiesLimit(deceased.deceasedBiographies, 1);
  }

  /**
   ** DeceasedSocialMediaLinkService
   */

  public validateCreateDeceasedSocialMediaLink(
    dto: CreateDeceasedSocialMediaLinkDto,
    deceased: TCreateDeceasedSocialMediaLink,
  ): void {
    const existingSocialMediaLink = deceased.deceasedSocialMediaLinks.some((link) => link.platform === dto.platform);

    if (existingSocialMediaLink) {
      throw new BadRequestException('Social media link for this platform already exists');
    }
  }

  public validateUpdateDeceasedSocialMediaLink(
    dto: UpdateDeceasedSocialMediaLinkDto,
    existingSocialMediaLink: TUpdateDeceasedSocialMediaLink,
  ): void {
    if (dto.url) {
      const pattern = SOCIAL_MEDIA_LINK_PATTERNS[existingSocialMediaLink.platform];

      if (!pattern.test(dto.url)) {
        throw new BadRequestException('Invalid social media link');
      }
    }
  }

  /**
   ** Common helpers
   */

  public validateOwnership(currentUser: ITokenUserPayload, entityUser: { id: string } | null): void {
    if (entityUser === null) {
      throw new BadRequestException('This highlight has no owner and cannot be edited');
    }

    if (entityUser.id !== currentUser.sub) {
      throw new ForbiddenException('You can only edit your own highlights');
    }
  }

  private validateEntitiesLimit(existingEntities: { id: string }[], newEntityItemsCount: number): void {
    if (existingEntities.length + newEntityItemsCount > this.HIGHLIGHTS_LIMIT) {
      throw new BadRequestException('Maximum number of entities reached');
    }
  }

  private validateEntityYearRange<T extends { startYear: number | null; endYear: number | null }>(
    existingEntity: T,
    startYear?: number | null,
    endYear?: number | null,
  ): void {
    const effectiveStartYear = startYear ?? existingEntity.startYear;
    const effectiveEndYear = endYear ?? existingEntity.endYear;

    if (effectiveStartYear !== null && effectiveEndYear !== null) {
      if (effectiveStartYear > effectiveEndYear) {
        throw new BadRequestException('Start year cannot be after end year');
      }
    }
  }
}

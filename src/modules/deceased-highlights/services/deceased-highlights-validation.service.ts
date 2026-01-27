import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateDeceasedEducationsDto,
  CreateDeceasedEmploymentsDto,
  CreateDeceasedHobbyDto,
  CreateDeceasedResidencesDto,
  CreateDeceasedSocialMediaLinkDto,
  UpdateDeceasedEducationDto,
  UpdateDeceasedEmploymentDto,
  UpdateDeceasedHobbyDto,
  UpdateDeceasedResidenceDto,
  UpdateDeceasedSocialMediaLinkDto,
} from 'src/modules/deceased-highlights/common/dto';
import {
  TCreateDeceasedBiography,
  TCreateDeceasedEducations,
  TCreateDeceasedEmployments,
  TCreateDeceasedHobby,
  TCreateDeceasedResidences,
  TCreateDeceasedSocialMediaLink,
  TUpdateDeceasedEducation,
  TUpdateDeceasedEmployment,
  TUpdateDeceasedResidence,
  TUpdateDeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/common/types';
import { DeceasedHobbyTag, DeceasedResidence } from 'src/modules/deceased-highlights/entities';
import { DeceasedHighLightsQueryOptionsService } from 'src/modules/deceased-highlights/services';
import { SOCIAL_MEDIA_LINK_PATTERNS } from 'src/modules/deceased-highlights/common/constants';

@Injectable()
export class DeceasedHighlightsValidationService {
  private readonly HIGHLIGHTS_LIMIT: number = 20;
  constructor(
    @InjectRepository(DeceasedResidence)
    private readonly deceasedResidenceRepository: Repository<DeceasedResidence>,
    @InjectRepository(DeceasedHobbyTag)
    private readonly deceasedHobbyTagRepository: Repository<DeceasedHobbyTag>,
    private readonly deceasedHighLightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
  ) {}

  /**
   ** DeceasedResidenceService
   */

  public async validateCreateDeceasedResidences(
    dto: CreateDeceasedResidencesDto,
    deceased: TCreateDeceasedResidences,
  ): Promise<void> {
    const hasNewBirthPlace = dto.residences.some((residence) => residence.isBirthPlace);

    if (hasNewBirthPlace) {
      await this.validateBirthplaceConstraint(deceased.id);
    }

    this.validateEntitiesLimit(deceased.deceasedResidences, dto.residences.length);
  }

  public async validateUpdateDeceasedResidence(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedResidence,
  ): Promise<void> {
    if (dto.isBirthPlace === true && existingDeceasedResidence.isBirthPlace === false) {
      await this.validateBirthplaceConstraint(existingDeceasedResidence.deceased.id);
    }

    this.validateEntityYearRange(existingDeceasedResidence, dto.startYear, dto.endYear);
  }

  private async validateBirthplaceConstraint(deceasedId: string): Promise<void> {
    const queryOptions = this.deceasedHighLightsQueryOptionsService.validateCreateDeceasedResidencesOptions(deceasedId);
    const existingBirthPlace = await this.deceasedResidenceRepository.exists(queryOptions);

    if (existingBirthPlace) {
      throw new BadRequestException('Only one deceased residence can be marked as birthplace');
    }
  }

  /**
   ** DeceasedEducationService
   */

  public validateCreateDeceasedEducations(dto: CreateDeceasedEducationsDto, deceased: TCreateDeceasedEducations): void {
    this.validateEntitiesLimit(deceased.deceasedEducations, dto.educations.length);
  }

  public validateUpdateDeceasedEducation(
    dto: UpdateDeceasedEducationDto,
    existingDeceasedResidence: TUpdateDeceasedEducation,
  ): void {
    this.validateEntityYearRange(existingDeceasedResidence, dto.startYear, dto.endYear);
  }

  /**
   ** DeceasedEmploymentService
   */

  public validateCreateDeceasedEmployments(
    dto: CreateDeceasedEmploymentsDto,
    deceased: TCreateDeceasedEmployments,
  ): void {
    this.validateEntitiesLimit(deceased.deceasedEmployments, dto.employments.length);
  }

  public validateUpdateDeceasedEmployment(
    dto: UpdateDeceasedEmploymentDto,
    existingDeceasedEmployment: TUpdateDeceasedEmployment,
  ): void {
    this.validateEntityYearRange(existingDeceasedEmployment, dto.startYear, dto.endYear);
  }

  /**
   ** DeceasedHobbyService
   */

  public async validateCreateDeceasedHobby(dto: CreateDeceasedHobbyDto, deceased: TCreateDeceasedHobby): Promise<void> {
    this.validateEntitiesLimit(deceased.deceasedHobbies, 1);

    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.ensureHobbyTagsExist(dto.tagIds);
    }
  }

  public async validateUpdateDeceasedHobby(dto: UpdateDeceasedHobbyDto): Promise<void> {
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.ensureHobbyTagsExist(dto.tagIds);
    }
  }

  private async ensureHobbyTagsExist(tagIds: string[]): Promise<void> {
    const queryOptions = this.deceasedHighLightsQueryOptionsService.ensureHobbyTagsExistOptions(tagIds);
    const existingTagsCount = await this.deceasedHobbyTagRepository.count(queryOptions);

    if (existingTagsCount !== tagIds.length) {
      throw new BadRequestException('Some tags do not exist');
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

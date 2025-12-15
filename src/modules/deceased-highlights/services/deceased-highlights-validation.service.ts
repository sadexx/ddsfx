import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  CreateDeceasedEducationsDto,
  CreateDeceasedEmploymentsDto,
  CreateDeceasedHobbyDto,
  CreateDeceasedResidencesDto,
  CreateDeceasedSocialMediaLinkDto,
  UpdateDeceasedEmploymentDto,
  UpdateDeceasedHobbyDto,
  UpdateDeceasedResidenceDto,
  UpdateDeceasedSocialMediaLinkDto,
} from 'src/modules/deceased-highlights/common/dto';
import {
  TUpdateDeceasedEducation,
  TUpdateDeceasedEmployment,
  TUpdateDeceasedResidence,
  TUpdateDeceasedSocialMediaLink,
  TValidateEntitiesLimit,
} from 'src/modules/deceased-highlights/common/types';
import {
  DeceasedBiography,
  DeceasedEducation,
  DeceasedEmployment,
  DeceasedHobby,
  DeceasedHobbyTag,
  DeceasedResidence,
  DeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/entities';
import { DeceasedHighLightsQueryOptionsService } from 'src/modules/deceased-highlights/services';
import { SOCIAL_MEDIA_LINK_PATTERNS } from 'src/modules/deceased-highlights/common/constants';

@Injectable()
export class DeceasedHighlightsValidationService {
  private readonly HIGHLIGHTS_LIMIT: number = 20;
  constructor(
    @InjectRepository(DeceasedResidence)
    private readonly deceasedResidenceRepository: Repository<DeceasedResidence>,
    @InjectRepository(DeceasedEducation)
    private readonly deceasedEducationRepository: Repository<DeceasedEducation>,
    @InjectRepository(DeceasedEmployment)
    private readonly deceasedEmploymentRepository: Repository<DeceasedEmployment>,
    @InjectRepository(DeceasedHobby)
    private readonly deceasedHobbyRepository: Repository<DeceasedHobby>,
    @InjectRepository(DeceasedHobbyTag)
    private readonly deceasedHobbyTagRepository: Repository<DeceasedHobbyTag>,
    @InjectRepository(DeceasedBiography)
    private readonly deceasedBiographyRepository: Repository<DeceasedBiography>,
    @InjectRepository(DeceasedSocialMediaLink)
    private readonly deceasedSocialMediaLinkRepository: Repository<DeceasedSocialMediaLink>,
    private readonly deceasedHighLightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
  ) {}

  /**
   ** DeceasedResidenceService
   */

  public async validateCreateDeceasedResidences(dto: CreateDeceasedResidencesDto, deceasedId: string): Promise<void> {
    const hasNewBirthPlace = dto.residences.some((residence) => residence.isBirthPlace);

    if (hasNewBirthPlace) {
      await this.validateBirthplaceConstraint(deceasedId);
    }

    await this.validateEntitiesLimit(this.deceasedResidenceRepository, deceasedId, dto.residences.length);
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

  public async validateCreateDeceasedEducations(dto: CreateDeceasedEducationsDto, deceasedId: string): Promise<void> {
    await this.validateEntitiesLimit(this.deceasedEducationRepository, deceasedId, dto.educations.length);
  }

  public validateUpdateDeceasedEducation(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedEducation,
  ): void {
    this.validateEntityYearRange(existingDeceasedResidence, dto.startYear, dto.endYear);
  }

  /**
   ** DeceasedEmploymentService
   */

  public async validateCreateDeceasedEmployments(dto: CreateDeceasedEmploymentsDto, deceasedId: string): Promise<void> {
    await this.validateEntitiesLimit(this.deceasedEmploymentRepository, deceasedId, dto.employments.length);
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

  public async validateCreateDeceasedHobby(dto: CreateDeceasedHobbyDto, deceasedId: string): Promise<void> {
    await this.validateEntitiesLimit(this.deceasedHobbyRepository, deceasedId, 1);

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

  public async validateCreateDeceasedBiography(deceasedId: string): Promise<void> {
    await this.validateEntitiesLimit(this.deceasedBiographyRepository, deceasedId, 1);
  }

  /**
   ** DeceasedSocialMediaLinkService
   */

  public async validateCreateDeceasedSocialMediaLink(
    dto: CreateDeceasedSocialMediaLinkDto,
    deceasedId: string,
  ): Promise<void> {
    const queryOptions = this.deceasedHighLightsQueryOptionsService.validateCreateDeceasedSocialMediaLinksOptions(
      deceasedId,
      dto.platform,
    );
    const existingSocialMediaLink = await this.deceasedSocialMediaLinkRepository.exists(queryOptions);

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

  private async validateEntitiesLimit<T extends TValidateEntitiesLimit>(
    repository: Repository<T>,
    deceasedId: string,
    newEntityItemsCount: number,
  ): Promise<void> {
    const existingEntitiesCount = await repository.count({
      where: { deceased: { id: deceasedId } } as FindOptionsWhere<T>,
    });

    if (existingEntitiesCount + newEntityItemsCount > this.HIGHLIGHTS_LIMIT) {
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

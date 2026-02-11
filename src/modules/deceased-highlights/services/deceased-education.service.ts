import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { UUIDParamDto } from 'src/common/dto';
import {
  TCreateDeceasedEducations,
  TGetDeceasedEducations,
  TRemoveDeceasedEducation,
  TUpdateDeceasedEducation,
} from 'src/modules/deceased-highlights/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import {
  CreateDeceasedEducationDto,
  CreateDeceasedEducationsDto,
  UpdateDeceasedEducationDto,
} from 'src/modules/deceased-highlights/common/dto';
import { findOneOrFailQueryBuilderTyped, findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { Deceased } from 'src/modules/deceased/entities';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { IDeceasedEducation } from 'src/modules/deceased-highlights/common/interfaces';
import { StrictOmit } from 'src/common/types';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';
import { User } from 'src/modules/users/entities';

@Injectable()
export class DeceasedEducationService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedPlaceEntry)
    private readonly deceasedPlaceEntryRepository: Repository<DeceasedPlaceEntry>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedEducations(param: UUIDParamDto): Promise<TGetDeceasedEducations[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedEducationsOptions(param.id);
    const deceasedEducations = await findManyTyped<TGetDeceasedEducations[]>(
      this.deceasedPlaceEntryRepository,
      queryOptions,
    );

    return deceasedEducations;
  }

  public async createDeceasedEducations(
    param: UUIDParamDto,
    dto: CreateDeceasedEducationsDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryBuilder = this.deceasedRepository.createQueryBuilder('deceased');
    this.deceasedHighlightsQueryOptionsService.createDeceasedEducationsOptions(queryBuilder, param.id);
    const deceased = await findOneOrFailQueryBuilderTyped<TCreateDeceasedEducations>(
      param.id,
      queryBuilder,
      Deceased.options.name,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    await this.deceasedHighlightsValidationService.validateCreateDeceasedEducations(dto, deceased);

    await this.constructAndCreateDeceasedEducations(user.sub, dto, deceased);
  }

  public async updateDeceasedEducation(
    param: UUIDParamDto,
    dto: UpdateDeceasedEducationDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedEducationOptions(param.id);
    const deceasedEducation = await findOneOrFailTyped<TUpdateDeceasedEducation>(
      param.id,
      this.deceasedPlaceEntryRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedEducation.deceased.id);
    this.deceasedHighlightsValidationService.validateOwnership(user, deceasedEducation.user);
    await this.deceasedHighlightsValidationService.validateUpdateDeceasedEducation(dto, deceasedEducation);

    await this.updateEducation(dto, deceasedEducation);
  }

  public async removeDeceasedEducation(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedEducationOptions(param.id);
    const deceasedEducation = await findOneOrFailTyped<TRemoveDeceasedEducation>(
      param.id,
      this.deceasedPlaceEntryRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedEducation.deceased.id);
    this.deceasedHighlightsValidationService.validateOwnership(user, deceasedEducation.user);

    await this.deceasedPlaceEntryRepository.delete(deceasedEducation.id);
  }

  private async constructAndCreateDeceasedEducations(
    userId: string,
    dto: CreateDeceasedEducationsDto,
    deceased: TCreateDeceasedEducations,
  ): Promise<void> {
    const educationDtos = dto.educations.map((education) =>
      this.constructCreateDeceasedEducationDto(userId, education, deceased),
    );
    await this.createDeceasedEducation(educationDtos);
  }

  private async createDeceasedEducation(dto: IDeceasedEducation[]): Promise<void> {
    const newDeceasedEducation = this.deceasedPlaceEntryRepository.create(dto);
    await this.deceasedPlaceEntryRepository.save(newDeceasedEducation);
  }

  private async updateEducation(
    dto: UpdateDeceasedEducationDto,
    existingDeceasedEducation: TUpdateDeceasedEducation,
  ): Promise<void> {
    const deceasedEducationDto = this.constructUpdateDeceasedEducationDto(dto, existingDeceasedEducation);
    await this.deceasedPlaceEntryRepository.update({ id: existingDeceasedEducation.id }, deceasedEducationDto);
  }

  private constructCreateDeceasedEducationDto(
    userId: string,
    dto: CreateDeceasedEducationDto,
    deceased: TCreateDeceasedEducations,
  ): IDeceasedEducation {
    return {
      deceased: deceased as Deceased,
      user: { id: userId } as User,
      institutionName: { id: dto.institutionNameId } as ReferenceCatalog,
      specialization: dto.specializationId ? ({ id: dto.specializationId } as ReferenceCatalog) : null,
      type: dto.type,
      description: dto.description ?? null,
      startYear: dto.startYear ?? null,
      endYear: dto.endYear ?? null,
    };
  }

  private constructUpdateDeceasedEducationDto(
    dto: UpdateDeceasedEducationDto,
    existingDeceasedEducation: TUpdateDeceasedEducation,
  ): StrictOmit<IDeceasedEducation, 'deceased' | 'user'> {
    const determinedInstitutionName = dto.institutionNameId
      ? ({ id: dto.institutionNameId } as ReferenceCatalog)
      : existingDeceasedEducation.institutionName;
    const determinedSpecialization =
      dto.specializationId !== undefined
        ? dto.specializationId
          ? ({ id: dto.specializationId } as ReferenceCatalog)
          : null
        : existingDeceasedEducation.specialization;

    return {
      institutionName: determinedInstitutionName,
      specialization: determinedSpecialization,
      type: dto.type ?? existingDeceasedEducation.type,
      description: dto.description !== undefined ? dto.description : existingDeceasedEducation.description,
      startYear: dto.startYear !== undefined ? dto.startYear : existingDeceasedEducation.startYear,
      endYear: dto.endYear !== undefined ? dto.endYear : existingDeceasedEducation.endYear,
    };
  }
}

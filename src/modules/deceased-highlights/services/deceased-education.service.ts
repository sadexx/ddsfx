import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeceasedEducation } from 'src/modules/deceased-highlights/entities';
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
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { Deceased } from 'src/modules/deceased/entities';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { IDeceasedEducation } from 'src/modules/deceased-highlights/common/interfaces';
import { StrictOmit } from 'src/common/types';

@Injectable()
export class DeceasedEducationService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedEducation)
    private readonly deceasedEducationRepository: Repository<DeceasedEducation>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedEducations(param: UUIDParamDto): Promise<TGetDeceasedEducations[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedEducationsOptions(param.id);
    const deceasedEducations = await findManyTyped<TGetDeceasedEducations[]>(
      this.deceasedEducationRepository,
      queryOptions,
    );

    return deceasedEducations;
  }

  public async createDeceasedEducations(
    param: UUIDParamDto,
    dto: CreateDeceasedEducationsDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.createDeceasedEducationsOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedEducations>(
      param.id,
      this.deceasedRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    this.deceasedHighlightsValidationService.validateCreateDeceasedEducations(dto, deceased);

    await this.constructAndCreateDeceasedEducations(dto, deceased);
  }

  public async updateDeceasedEducation(
    param: UUIDParamDto,
    dto: UpdateDeceasedEducationDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedEducationOptions(param.id);
    const deceasedEducation = await findOneOrFailTyped<TUpdateDeceasedEducation>(
      param.id,
      this.deceasedEducationRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedEducation.deceased.id);
    this.deceasedHighlightsValidationService.validateUpdateDeceasedEducation(dto, deceasedEducation);

    await this.updateEducation(dto, deceasedEducation);
  }

  public async removeDeceasedEducation(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedEducationOptions(param.id);
    const deceasedEducation = await findOneOrFailTyped<TRemoveDeceasedEducation>(
      param.id,
      this.deceasedEducationRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedEducation.deceased.id);

    await this.deceasedEducationRepository.delete(deceasedEducation.id);
  }

  private async constructAndCreateDeceasedEducations(
    dto: CreateDeceasedEducationsDto,
    deceased: TCreateDeceasedEducations,
  ): Promise<DeceasedEducation[]> {
    const educationDtos = dto.educations.map((education) =>
      this.constructCreateDeceasedEducationDto(education, deceased),
    );

    return await this.createDeceasedEducation(educationDtos);
  }

  private async createDeceasedEducation(dto: IDeceasedEducation[]): Promise<DeceasedEducation[]> {
    const newDeceasedEducation = this.deceasedEducationRepository.create(dto);

    return await this.deceasedEducationRepository.save(newDeceasedEducation);
  }

  private async updateEducation(
    dto: UpdateDeceasedEducationDto,
    existingDeceasedEducation: TUpdateDeceasedEducation,
  ): Promise<void> {
    const deceasedEducationDto = this.constructUpdateDeceasedEducationDto(dto, existingDeceasedEducation);
    await this.deceasedEducationRepository.update({ id: existingDeceasedEducation.id }, deceasedEducationDto);
  }

  private constructCreateDeceasedEducationDto(
    dto: CreateDeceasedEducationDto,
    deceased: TCreateDeceasedEducations,
  ): IDeceasedEducation {
    return {
      type: dto.type,
      institutionName: dto.institutionName,
      city: dto.city ?? null,
      country: dto.country ?? null,
      specialization: dto.specialization ?? null,
      description: dto.description ?? null,
      startYear: dto.startYear ?? null,
      endYear: dto.endYear ?? null,
      deceased,
    };
  }

  private constructUpdateDeceasedEducationDto(
    dto: UpdateDeceasedEducationDto,
    existingDeceasedEducation: TUpdateDeceasedEducation,
  ): StrictOmit<IDeceasedEducation, 'deceased'> {
    return {
      type: dto.type ?? existingDeceasedEducation.type,
      institutionName: dto.institutionName ?? existingDeceasedEducation.institutionName,
      city: dto.city !== undefined ? dto.city : existingDeceasedEducation.city,
      country: dto.country !== undefined ? dto.country : existingDeceasedEducation.country,
      specialization: dto.specialization !== undefined ? dto.specialization : existingDeceasedEducation.specialization,
      description: dto.description !== undefined ? dto.description : existingDeceasedEducation.description,
      startYear: dto.startYear !== undefined ? dto.startYear : existingDeceasedEducation.startYear,
      endYear: dto.endYear !== undefined ? dto.endYear : existingDeceasedEducation.endYear,
    };
  }
}

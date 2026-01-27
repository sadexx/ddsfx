import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import {
  CreateDeceasedEmploymentDto,
  CreateDeceasedEmploymentsDto,
  UpdateDeceasedEmploymentDto,
} from 'src/modules/deceased-highlights/common/dto';
import { DeceasedEmployment } from 'src/modules/deceased-highlights/entities';
import { Repository } from 'typeorm';
import { IDeceasedEmployment } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  TCreateDeceasedEmployments,
  TGetDeceasedEmployments,
  TRemoveDeceasedEmployment,
  TUpdateDeceasedEmployment,
} from 'src/modules/deceased-highlights/common/types';
import { StrictOmit } from 'src/common/types';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findManyTyped } from 'src/common/utils/find-many-typed';

@Injectable()
export class DeceasedEmploymentService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedEmployment)
    private readonly deceasedEmploymentRepository: Repository<DeceasedEmployment>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedEmployments(param: UUIDParamDto): Promise<TGetDeceasedEmployments[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedEmploymentsOptions(param.id);
    const deceasedEmployments = await findManyTyped<TGetDeceasedEmployments[]>(
      this.deceasedEmploymentRepository,
      queryOptions,
    );

    return deceasedEmployments;
  }

  public async createDeceasedEmployments(
    param: UUIDParamDto,
    dto: CreateDeceasedEmploymentsDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.createDeceasedEmploymentsOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedEmployments>(
      param.id,
      this.deceasedRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    this.deceasedHighlightsValidationService.validateCreateDeceasedEmployments(dto, deceased);

    await this.constructAndCreateDeceasedEmployments(dto, deceased);
  }

  public async updateDeceasedEmployment(
    param: UUIDParamDto,
    dto: UpdateDeceasedEmploymentDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedEmploymentOptions(param.id);
    const deceasedEmployment = await findOneOrFailTyped<TUpdateDeceasedEmployment>(
      param.id,
      this.deceasedEmploymentRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedEmployment.deceased.id);
    this.deceasedHighlightsValidationService.validateUpdateDeceasedEmployment(dto, deceasedEmployment);

    await this.updateEmployment(dto, deceasedEmployment);
  }

  public async removeDeceasedEmployment(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedEmploymentOptions(param.id);
    const deceasedEmployment = await findOneOrFailTyped<TRemoveDeceasedEmployment>(
      param.id,
      this.deceasedEmploymentRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedEmployment.deceased.id);

    await this.deceasedEmploymentRepository.delete(deceasedEmployment.id);
  }

  private async constructAndCreateDeceasedEmployments(
    dto: CreateDeceasedEmploymentsDto,
    deceased: TCreateDeceasedEmployments,
  ): Promise<DeceasedEmployment[]> {
    const employmentDtos = dto.employments.map((employment) =>
      this.constructCreateDeceasedEmploymentDto(employment, deceased),
    );

    return await this.createDeceasedEmployment(employmentDtos);
  }

  private async createDeceasedEmployment(dto: IDeceasedEmployment[]): Promise<DeceasedEmployment[]> {
    const newDeceasedEmployment = this.deceasedEmploymentRepository.create(dto);

    return await this.deceasedEmploymentRepository.save(newDeceasedEmployment);
  }

  private async updateEmployment(
    dto: UpdateDeceasedEmploymentDto,
    existingDeceasedEmployment: TUpdateDeceasedEmployment,
  ): Promise<void> {
    const deceasedEmploymentDto = this.constructUpdateDeceasedEmploymentDto(dto, existingDeceasedEmployment);
    await this.deceasedEmploymentRepository.update({ id: existingDeceasedEmployment.id }, deceasedEmploymentDto);
  }

  private constructCreateDeceasedEmploymentDto(
    dto: CreateDeceasedEmploymentDto,
    deceased: TCreateDeceasedEmployments,
  ): IDeceasedEmployment {
    return {
      companyName: dto.companyName,
      position: dto.position ?? null,
      description: dto.description ?? null,
      startYear: dto.startYear ?? null,
      endYear: dto.endYear ?? null,
      deceased,
    };
  }

  private constructUpdateDeceasedEmploymentDto(
    dto: UpdateDeceasedEmploymentDto,
    existingDeceasedEmployment: TUpdateDeceasedEmployment,
  ): StrictOmit<IDeceasedEmployment, 'deceased'> {
    return {
      companyName: dto.companyName ?? existingDeceasedEmployment.companyName,
      position: dto.position !== undefined ? dto.position : existingDeceasedEmployment.position,
      description: dto.description !== undefined ? dto.description : existingDeceasedEmployment.description,
      startYear: dto.startYear !== undefined ? dto.startYear : existingDeceasedEmployment.startYear,
      endYear: dto.endYear !== undefined ? dto.endYear : existingDeceasedEmployment.endYear,
    };
  }
}

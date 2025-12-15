import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import {
  CreateDeceasedEmploymentDto,
  CreateDeceasedEmploymentsDto,
  UpdateDeceasedEmploymentDto,
} from 'src/modules/deceased-highlights/common/dto';
import { DeceasedEmployment } from 'src/modules/deceased-highlights/entities';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
    private readonly dataSource: DataSource,
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
    await this.deceasedHighlightsValidationService.validateCreateDeceasedEmployments(dto, deceased.id);

    await this.dataSource.transaction(async (manager) => {
      await this.constructAndCreateDeceasedEmployments(manager, dto, deceased);
    });
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
    manager: EntityManager,
    dto: CreateDeceasedEmploymentsDto,
    deceased: TCreateDeceasedEmployments,
  ): Promise<DeceasedEmployment[]> {
    const employmentDtos = dto.employments.map((employment) =>
      this.constructCreateDeceasedEmploymentDto(employment, deceased),
    );

    return await this.createDeceasedEmployment(manager, employmentDtos);
  }

  private async createDeceasedEmployment(
    manager: EntityManager,
    dto: IDeceasedEmployment[],
  ): Promise<DeceasedEmployment[]> {
    const deceasedEmploymentRepository = manager.getRepository(DeceasedEmployment);
    const newDeceasedEmployment = deceasedEmploymentRepository.create(dto);

    return await deceasedEmploymentRepository.save(newDeceasedEmployment);
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
      position: dto.position,
      companyName: dto.companyName ?? null,
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
      position: dto.position ?? existingDeceasedEmployment.position,
      description: dto.description ?? existingDeceasedEmployment.description,
      startYear: dto.startYear ?? existingDeceasedEmployment.startYear,
      endYear: dto.endYear ?? existingDeceasedEmployment.endYear,
    };
  }
}

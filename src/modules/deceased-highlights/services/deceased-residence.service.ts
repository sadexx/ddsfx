import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import {
  CreateDeceasedResidenceDto,
  CreateDeceasedResidencesDto,
  UpdateDeceasedResidenceDto,
} from 'src/modules/deceased-highlights/common/dto';
import { DeceasedResidence } from 'src/modules/deceased-highlights/entities';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { IDeceasedResidence } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  TCreateDeceasedResidences,
  TGetDeceasedResidences,
  TRemoveDeceasedResidence,
  TUpdateDeceasedResidence,
} from 'src/modules/deceased-highlights/common/types';
import { StrictOmit } from 'src/common/types';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findManyTyped } from 'src/common/utils/find-many-typed';

@Injectable()
export class DeceasedResidenceService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedResidence)
    private readonly deceasedResidenceRepository: Repository<DeceasedResidence>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
    private readonly dataSource: DataSource,
  ) {}

  public async getDeceasedResidences(param: UUIDParamDto): Promise<TGetDeceasedResidences[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedResidencesOptions(param.id);
    const deceasedResidences = await findManyTyped<TGetDeceasedResidences[]>(
      this.deceasedResidenceRepository,
      queryOptions,
    );

    return deceasedResidences;
  }

  public async createDeceasedResidences(
    param: UUIDParamDto,
    dto: CreateDeceasedResidencesDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.createDeceasedResidencesOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedResidences>(
      param.id,
      this.deceasedRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    await this.deceasedHighlightsValidationService.validateCreateDeceasedResidences(dto, deceased.id);

    await this.dataSource.transaction(async (manager) => {
      await this.constructAndCreateDeceasedResidences(manager, dto, deceased);
    });
  }

  public async updateDeceasedResidence(
    param: UUIDParamDto,
    dto: UpdateDeceasedResidenceDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedResidenceOptions(param.id);
    const deceasedResidence = await findOneOrFailTyped<TUpdateDeceasedResidence>(
      param.id,
      this.deceasedResidenceRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedResidence.deceased.id);
    await this.deceasedHighlightsValidationService.validateUpdateDeceasedResidence(dto, deceasedResidence);

    await this.updateResidence(dto, deceasedResidence);
  }

  public async removeDeceasedResidence(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedResidenceOptions(param.id);
    const deceasedResidence = await findOneOrFailTyped<TRemoveDeceasedResidence>(
      param.id,
      this.deceasedResidenceRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedResidence.deceased.id);

    await this.deceasedResidenceRepository.delete(deceasedResidence.id);
  }

  private async constructAndCreateDeceasedResidences(
    manager: EntityManager,
    dto: CreateDeceasedResidencesDto,
    deceased: TCreateDeceasedResidences,
  ): Promise<DeceasedResidence[]> {
    const residenceDtos = dto.residences.map((residence) =>
      this.constructCreateDeceasedResidenceDto(residence, deceased),
    );

    return await this.createDeceasedResidence(manager, residenceDtos);
  }

  private async createDeceasedResidence(
    manager: EntityManager,
    dto: IDeceasedResidence[],
  ): Promise<DeceasedResidence[]> {
    const deceasedResidenceRepository = manager.getRepository(DeceasedResidence);
    const newDeceasedResidence = deceasedResidenceRepository.create(dto);

    return await deceasedResidenceRepository.save(newDeceasedResidence);
  }

  private async updateResidence(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedResidence,
  ): Promise<void> {
    const deceasedResidenceDto = this.constructUpdateDeceasedResidenceDto(dto, existingDeceasedResidence);
    await this.deceasedResidenceRepository.update({ id: existingDeceasedResidence.id }, deceasedResidenceDto);
  }

  private constructCreateDeceasedResidenceDto(
    dto: CreateDeceasedResidenceDto,
    deceased: TCreateDeceasedResidences,
  ): IDeceasedResidence {
    return {
      city: dto.city,
      isBirthPlace: dto.isBirthPlace ?? false,
      country: dto.country ?? null,
      description: dto.description ?? null,
      startYear: dto.startYear ?? null,
      endYear: dto.endYear ?? null,
      deceased,
    };
  }

  private constructUpdateDeceasedResidenceDto(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedResidence,
  ): StrictOmit<IDeceasedResidence, 'deceased'> {
    return {
      city: dto.city ?? existingDeceasedResidence.city,
      country: dto.country ?? existingDeceasedResidence.country,
      description: dto.description ?? existingDeceasedResidence.description,
      startYear: dto.startYear ?? existingDeceasedResidence.startYear,
      endYear: dto.endYear ?? existingDeceasedResidence.endYear,
      isBirthPlace: dto.isBirthPlace ?? existingDeceasedResidence.isBirthPlace,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import {
  CreateDeceasedResidenceDto,
  CreateDeceasedResidencesDto,
  UpdateDeceasedResidenceDto,
} from 'src/modules/deceased-highlights/common/dto';
import { DeceasedPlaceEntry } from 'src/modules/deceased-highlights/entities';
import { Repository } from 'typeorm';
import { IDeceasedResidence } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailQueryBuilderTyped, findOneOrFailTyped } from 'src/common/utils/find-one-typed';
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
import { EDeceasedPlaceEntryType } from 'src/modules/deceased-highlights/common/enums';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';
import { User } from 'src/modules/users/entities';

@Injectable()
export class DeceasedResidenceService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedPlaceEntry)
    private readonly deceasedPlaceEntryRepository: Repository<DeceasedPlaceEntry>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedResidences(param: UUIDParamDto): Promise<TGetDeceasedResidences[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedResidencesOptions(param.id);
    const deceasedResidences = await findManyTyped<TGetDeceasedResidences[]>(
      this.deceasedPlaceEntryRepository,
      queryOptions,
    );

    return deceasedResidences;
  }

  public async createDeceasedResidences(
    param: UUIDParamDto,
    dto: CreateDeceasedResidencesDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryBuilder = this.deceasedRepository.createQueryBuilder('deceased');
    this.deceasedHighlightsQueryOptionsService.createDeceasedResidencesOptions(queryBuilder, param.id);
    const deceased = await findOneOrFailQueryBuilderTyped<TCreateDeceasedResidences>(
      param.id,
      queryBuilder,
      Deceased.options.name,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    await this.deceasedHighlightsValidationService.validateCreateDeceasedResidences(dto, deceased);

    await this.constructAndCreateDeceasedResidences(user.sub, dto, deceased);
  }

  public async updateDeceasedResidence(
    param: UUIDParamDto,
    dto: UpdateDeceasedResidenceDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedResidenceOptions(param.id);
    const deceasedResidence = await findOneOrFailTyped<TUpdateDeceasedResidence>(
      param.id,
      this.deceasedPlaceEntryRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedResidence.deceased.id);
    this.deceasedHighlightsValidationService.validateOwnership(user, deceasedResidence.user);
    await this.deceasedHighlightsValidationService.validateUpdateDeceasedResidence(dto, deceasedResidence);

    await this.updateResidence(dto, deceasedResidence);
  }

  public async removeDeceasedResidence(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedResidenceOptions(param.id);
    const deceasedResidence = await findOneOrFailTyped<TRemoveDeceasedResidence>(
      param.id,
      this.deceasedPlaceEntryRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedResidence.deceased.id);
    this.deceasedHighlightsValidationService.validateOwnership(user, deceasedResidence.user);

    await this.deceasedPlaceEntryRepository.delete(deceasedResidence.id);
  }

  private async constructAndCreateDeceasedResidences(
    userId: string,
    dto: CreateDeceasedResidencesDto,
    deceased: TCreateDeceasedResidences,
  ): Promise<void> {
    const residenceDtos = dto.residences.map((residence) =>
      this.constructCreateDeceasedResidenceDto(userId, residence, deceased),
    );
    await this.createDeceasedResidence(residenceDtos);
  }

  private async createDeceasedResidence(dto: IDeceasedResidence[]): Promise<void> {
    const newDeceasedResidence = this.deceasedPlaceEntryRepository.create(dto);
    await this.deceasedPlaceEntryRepository.save(newDeceasedResidence);
  }

  private async updateResidence(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedResidence,
  ): Promise<void> {
    const deceasedResidenceDto = this.constructUpdateDeceasedResidenceDto(dto, existingDeceasedResidence);
    await this.deceasedPlaceEntryRepository.update({ id: existingDeceasedResidence.id }, deceasedResidenceDto);
  }

  private constructCreateDeceasedResidenceDto(
    userId: string,
    dto: CreateDeceasedResidenceDto,
    deceased: TCreateDeceasedResidences,
  ): IDeceasedResidence {
    return {
      deceased: deceased as Deceased,
      user: { id: userId } as User,
      city: { id: dto.cityId } as ReferenceCatalog,
      type: EDeceasedPlaceEntryType.RESIDENCE,
      isBirthPlace: dto.isBirthPlace ?? false,
      description: dto.description ?? null,
      startYear: dto.startYear ?? null,
      endYear: dto.endYear ?? null,
    };
  }

  private constructUpdateDeceasedResidenceDto(
    dto: UpdateDeceasedResidenceDto,
    existingDeceasedResidence: TUpdateDeceasedResidence,
  ): StrictOmit<IDeceasedResidence, 'deceased' | 'user' | 'type'> {
    return {
      city: dto.cityId ? ({ id: dto.cityId } as ReferenceCatalog) : existingDeceasedResidence.city,
      isBirthPlace: dto.isBirthPlace ?? existingDeceasedResidence.isBirthPlace,
      description: dto.description !== undefined ? dto.description : existingDeceasedResidence.description,
      startYear: dto.startYear !== undefined ? dto.startYear : existingDeceasedResidence.startYear,
      endYear: dto.endYear !== undefined ? dto.endYear : existingDeceasedResidence.endYear,
    };
  }
}

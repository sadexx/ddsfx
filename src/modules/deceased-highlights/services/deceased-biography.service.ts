import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import { CreateDeceasedBiographyDto, UpdateDeceasedBiographyDto } from 'src/modules/deceased-highlights/common/dto';
import { DeceasedBiography } from 'src/modules/deceased-highlights/entities';
import { Repository } from 'typeorm';
import { IDeceasedBiography } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  TCreateDeceasedBiography,
  TGetDeceasedBiographies,
  TRemoveDeceasedBiography,
  TUpdateDeceasedBiography,
} from 'src/modules/deceased-highlights/common/types';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { StrictOmit } from 'src/common/types';
import { User } from 'src/modules/users/entities';

@Injectable()
export class DeceasedBiographyService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedBiography)
    private readonly deceasedBiographyRepository: Repository<DeceasedBiography>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedBiographies(param: UUIDParamDto): Promise<TGetDeceasedBiographies[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedBiographiesOptions(param.id);
    const deceasedBiographies = await findManyTyped<TGetDeceasedBiographies[]>(
      this.deceasedBiographyRepository,
      queryOptions,
    );

    return deceasedBiographies;
  }

  public async createDeceasedBiography(
    param: UUIDParamDto,
    dto: CreateDeceasedBiographyDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.createDeceasedBiographyOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedBiography>(
      param.id,
      this.deceasedRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    this.deceasedHighlightsValidationService.validateCreateDeceasedBiography(deceased);

    await this.constructAndCreateDeceasedBiography(user.sub, dto, deceased);
  }

  public async updateDeceasedBiography(
    param: UUIDParamDto,
    dto: UpdateDeceasedBiographyDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedBiographyOptions(param.id);
    const deceasedBiography = await findOneOrFailTyped<TUpdateDeceasedBiography>(
      param.id,
      this.deceasedBiographyRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedBiography.deceased.id);
    this.deceasedHighlightsValidationService.validateOwnership(user, deceasedBiography.user);

    await this.updateBiography(dto, deceasedBiography);
  }

  public async removeDeceasedBiography(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedBiographyOptions(param.id);
    const deceasedBiography = await findOneOrFailTyped<TRemoveDeceasedBiography>(
      param.id,
      this.deceasedBiographyRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedBiography.deceased.id);
    this.deceasedHighlightsValidationService.validateOwnership(user, deceasedBiography.user);

    await this.deceasedBiographyRepository.delete(deceasedBiography.id);
  }

  private async constructAndCreateDeceasedBiography(
    userId: string,
    dto: CreateDeceasedBiographyDto,
    deceased: TCreateDeceasedBiography,
  ): Promise<void> {
    const biographyDto = this.constructCreateDeceasedBiographyDto(userId, dto, deceased);
    await this.createBiography(biographyDto);
  }

  private async createBiography(dto: IDeceasedBiography): Promise<void> {
    const newDeceasedBiography = this.deceasedBiographyRepository.create(dto);
    await this.deceasedBiographyRepository.save(newDeceasedBiography);
  }

  private async updateBiography(
    dto: UpdateDeceasedBiographyDto,
    existingDeceasedBiography: TUpdateDeceasedBiography,
  ): Promise<void> {
    const deceasedBiographyDto = this.constructUpdateDeceasedBiographyDto(dto, existingDeceasedBiography);
    await this.deceasedBiographyRepository.update({ id: existingDeceasedBiography.id }, deceasedBiographyDto);
  }

  private constructCreateDeceasedBiographyDto(
    userId: string,
    dto: CreateDeceasedBiographyDto,
    deceased: TCreateDeceasedBiography,
  ): IDeceasedBiography {
    return {
      deceased: deceased as Deceased,
      user: { id: userId } as User,
      description: dto.description,
    };
  }

  private constructUpdateDeceasedBiographyDto(
    dto: UpdateDeceasedBiographyDto,
    existingDeceasedBiography: TUpdateDeceasedBiography,
  ): StrictOmit<IDeceasedBiography, 'deceased' | 'user'> {
    return {
      description: dto.description ?? existingDeceasedBiography.description,
    };
  }
}

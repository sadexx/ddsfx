import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import { CreateDeceasedHobbyDto, UpdateDeceasedHobbyDto } from 'src/modules/deceased-highlights/common/dto';
import { DeceasedHobby, DeceasedHobbyTag, DeceasedHobbyTagCategory } from 'src/modules/deceased-highlights/entities';
import { Repository } from 'typeorm';
import { IDeceasedHobby } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  TCreateDeceasedHobby,
  TGetDeceasedHobbies,
  TGetDeceasedHobbyTags,
  TRemoveDeceasedHobby,
  TUpdateDeceasedHobby,
} from 'src/modules/deceased-highlights/common/types';
import { StrictOmit } from 'src/common/types';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findManyTyped } from 'src/common/utils/find-many-typed';

@Injectable()
export class DeceasedHobbyService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedHobby)
    private readonly deceasedHobbyRepository: Repository<DeceasedHobby>,
    @InjectRepository(DeceasedHobbyTagCategory)
    private readonly deceasedHobbyTagCategoryRepository: Repository<DeceasedHobbyTagCategory>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedHobbies(param: UUIDParamDto): Promise<TGetDeceasedHobbies[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedHobbiesOptions(param.id);
    const deceasedHobbies = await findManyTyped<TGetDeceasedHobbies[]>(this.deceasedHobbyRepository, queryOptions);

    return deceasedHobbies;
  }

  public async getDeceasedHobbyTags(): Promise<TGetDeceasedHobbyTags[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedHobbyTagsOptions();
    const deceasedHobbyTags = await findManyTyped<TGetDeceasedHobbyTags[]>(
      this.deceasedHobbyTagCategoryRepository,
      queryOptions,
    );

    return deceasedHobbyTags;
  }

  public async createDeceasedHobby(
    param: UUIDParamDto,
    dto: CreateDeceasedHobbyDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.createDeceasedHobbyOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedHobby>(param.id, this.deceasedRepository, queryOptions);

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    await this.deceasedHighlightsValidationService.validateCreateDeceasedHobby(dto, deceased.id);

    await this.constructAndCreateDeceasedHobby(dto, deceased);
  }

  public async updateDeceasedHobby(
    param: UUIDParamDto,
    dto: UpdateDeceasedHobbyDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedHobbyOptions(param.id);
    const deceasedHobby = await findOneOrFailTyped<TUpdateDeceasedHobby>(
      param.id,
      this.deceasedHobbyRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedHobby.deceased.id);
    await this.deceasedHighlightsValidationService.validateUpdateDeceasedHobby(dto);

    await this.updateHobby(dto, deceasedHobby);
  }

  public async removeDeceasedHobby(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedHobbyOptions(param.id);
    const deceasedHobby = await findOneOrFailTyped<TRemoveDeceasedHobby>(
      param.id,
      this.deceasedHobbyRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedHobby.deceased.id);

    await this.deceasedHobbyRepository.delete(deceasedHobby.id);
  }

  private async constructAndCreateDeceasedHobby(
    dto: CreateDeceasedHobbyDto,
    deceased: TCreateDeceasedHobby,
  ): Promise<DeceasedHobby> {
    const hobbyDto = this.constructCreateDeceasedHobbyDto(dto, deceased);

    return await this.createHobby(hobbyDto);
  }

  private async createHobby(dto: IDeceasedHobby): Promise<DeceasedHobby> {
    const newDeceasedHobby = this.deceasedHobbyRepository.create(dto);

    return await this.deceasedHobbyRepository.save(newDeceasedHobby);
  }

  private async updateHobby(dto: UpdateDeceasedHobbyDto, existingDeceasedHobby: TUpdateDeceasedHobby): Promise<void> {
    const deceasedHobbyDto = this.constructUpdateDeceasedHobbyDto(dto, existingDeceasedHobby);
    await this.deceasedHobbyRepository.save({ id: existingDeceasedHobby.id, ...deceasedHobbyDto });
  }

  private constructCreateDeceasedHobbyDto(dto: CreateDeceasedHobbyDto, deceased: TCreateDeceasedHobby): IDeceasedHobby {
    const hobbyTags = dto.tagIds ? dto.tagIds.map((tagId) => ({ id: tagId })) : [];

    return {
      description: dto.description,
      deceased,
      deceasedHobbyTags: hobbyTags as DeceasedHobbyTag[],
    };
  }

  private constructUpdateDeceasedHobbyDto(
    dto: UpdateDeceasedHobbyDto,
    existingDeceasedHobby: TUpdateDeceasedHobby,
  ): StrictOmit<IDeceasedHobby, 'deceased'> {
    const hobbyTags =
      dto.tagIds !== undefined ? dto.tagIds.map((tagId) => ({ id: tagId })) : existingDeceasedHobby.deceasedHobbyTags;

    return {
      description: dto.description ?? existingDeceasedHobby.description,
      deceasedHobbyTags: hobbyTags as DeceasedHobbyTag[],
    };
  }
}

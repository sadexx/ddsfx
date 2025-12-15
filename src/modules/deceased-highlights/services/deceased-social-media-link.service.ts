import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import {
  CreateDeceasedSocialMediaLinkDto,
  UpdateDeceasedSocialMediaLinkDto,
} from 'src/modules/deceased-highlights/common/dto';
import { DeceasedSocialMediaLink } from 'src/modules/deceased-highlights/entities';
import { Repository } from 'typeorm';
import { IDeceasedSocialMediaLink } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  TCreateDeceasedSocialMediaLink,
  TGetDeceasedSocialMediaLinks,
  TRemoveDeceasedSocialMediaLink,
  TUpdateDeceasedSocialMediaLink,
} from 'src/modules/deceased-highlights/common/types';
import { StrictOmit } from 'src/common/types';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findManyTyped } from 'src/common/utils/find-many-typed';

@Injectable()
export class DeceasedSocialMediaLinkService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedSocialMediaLink)
    private readonly deceasedSocialMediaLinkRepository: Repository<DeceasedSocialMediaLink>,
    private readonly deceasedHighlightsQueryOptionsService: DeceasedHighLightsQueryOptionsService,
    private readonly deceasedHighlightsValidationService: DeceasedHighlightsValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
  ) {}

  public async getDeceasedSocialMediaLinks(param: UUIDParamDto): Promise<TGetDeceasedSocialMediaLinks[]> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.getDeceasedSocialMediaLinksOptions(param.id);
    const deceasedSocialMediaLinks = await findManyTyped<TGetDeceasedSocialMediaLinks[]>(
      this.deceasedSocialMediaLinkRepository,
      queryOptions,
    );

    return deceasedSocialMediaLinks;
  }

  public async createDeceasedSocialMediaLink(
    param: UUIDParamDto,
    dto: CreateDeceasedSocialMediaLinkDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.createDeceasedSocialMediaLinkOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedSocialMediaLink>(
      param.id,
      this.deceasedRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    await this.deceasedHighlightsValidationService.validateCreateDeceasedSocialMediaLink(dto, deceased.id);

    await this.constructAndCreateDeceasedSocialMediaLink(dto, deceased);
  }

  public async updateDeceasedSocialMediaLink(
    param: UUIDParamDto,
    dto: UpdateDeceasedSocialMediaLinkDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.updateDeceasedSocialMediaLinkOptions(param.id);
    const deceasedSocialMediaLink = await findOneOrFailTyped<TUpdateDeceasedSocialMediaLink>(
      param.id,
      this.deceasedSocialMediaLinkRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedSocialMediaLink.deceased.id);
    this.deceasedHighlightsValidationService.validateUpdateDeceasedSocialMediaLink(dto, deceasedSocialMediaLink);

    await this.updateSocialMediaLink(dto, deceasedSocialMediaLink);
  }

  public async removeDeceasedSocialMediaLink(param: UUIDParamDto, user: ITokenUserPayload): Promise<void> {
    const queryOptions = this.deceasedHighlightsQueryOptionsService.removeDeceasedSocialMediaLinkOptions(param.id);
    const deceasedSocialMediaLink = await findOneOrFailTyped<TRemoveDeceasedSocialMediaLink>(
      param.id,
      this.deceasedSocialMediaLinkRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, deceasedSocialMediaLink.deceased.id);

    await this.deceasedSocialMediaLinkRepository.delete(deceasedSocialMediaLink.id);
  }

  private async constructAndCreateDeceasedSocialMediaLink(
    dto: CreateDeceasedSocialMediaLinkDto,
    deceased: TCreateDeceasedSocialMediaLink,
  ): Promise<DeceasedSocialMediaLink> {
    const socialMediaLinkDto = this.constructCreateDeceasedSocialMediaLinkDto(dto, deceased);

    return await this.createSocialMediaLink(socialMediaLinkDto);
  }

  private async createSocialMediaLink(dto: IDeceasedSocialMediaLink): Promise<DeceasedSocialMediaLink> {
    const newDeceasedSocialMediaLink = this.deceasedSocialMediaLinkRepository.create(dto);

    return await this.deceasedSocialMediaLinkRepository.save(newDeceasedSocialMediaLink);
  }

  private async updateSocialMediaLink(
    dto: UpdateDeceasedSocialMediaLinkDto,
    existingSocialMediaLink: TUpdateDeceasedSocialMediaLink,
  ): Promise<void> {
    const deceasedSocialMediaLinkDto = this.constructUpdateDeceasedSocialMediaLinkDto(dto, existingSocialMediaLink);
    await this.deceasedSocialMediaLinkRepository.update({ id: existingSocialMediaLink.id }, deceasedSocialMediaLinkDto);
  }

  private constructCreateDeceasedSocialMediaLinkDto(
    dto: CreateDeceasedSocialMediaLinkDto,
    deceased: TCreateDeceasedSocialMediaLink,
  ): IDeceasedSocialMediaLink {
    return {
      platform: dto.platform,
      url: dto.url,
      deceased,
    };
  }

  private constructUpdateDeceasedSocialMediaLinkDto(
    dto: UpdateDeceasedSocialMediaLinkDto,
    existingSocialMediaLink: TUpdateDeceasedSocialMediaLink,
  ): StrictOmit<IDeceasedSocialMediaLink, 'deceased' | 'platform'> {
    return {
      url: dto.url ?? existingSocialMediaLink.url,
    };
  }
}

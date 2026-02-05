import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Deceased, DeceasedMediaContent } from 'src/modules/deceased/entities';
import { Repository } from 'typeorm';
import { UUIDParamDto } from 'src/common/dto';
import { CreateDeceasedMediaContentDto } from 'src/modules/deceased/common/dto';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { File } from 'src/libs/file-management/entities';
import { IDeceasedMediaContent } from 'src/modules/deceased/common/interfaces';
import { EDeceasedMediaContentType } from 'src/modules/deceased/common/enums';
import {
  DeceasedQueryOptionsService,
  DeceasedSubscriptionService,
  DeceasedValidationService,
} from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { TCreateDeceasedMediaContent } from 'src/modules/deceased/common/types';
import { OpenSearchSyncService } from 'src/modules/external-sync/services';

@Injectable()
export class DeceasedMediaContentService {
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    @InjectRepository(DeceasedMediaContent)
    private readonly deceasedMediaContentRepository: Repository<DeceasedMediaContent>,
    private readonly deceasedQueryOptionsService: DeceasedQueryOptionsService,
    private readonly deceasedValidationService: DeceasedValidationService,
    private readonly deceasedSubscriptionService: DeceasedSubscriptionService,
    private readonly openSearchSyncService: OpenSearchSyncService,
  ) {}

  public async createDeceasedMediaContent(
    param: UUIDParamDto,
    dto: CreateDeceasedMediaContentDto,
    user: ITokenUserPayload,
  ): Promise<void> {
    const queryOptions = this.deceasedQueryOptionsService.createDeceasedMediaContentOptions(param.id);
    const deceased = await findOneOrFailTyped<TCreateDeceasedMediaContent>(
      param.id,
      this.deceasedRepository,
      queryOptions,
    );

    await this.deceasedSubscriptionService.ensureDeceasedSubscription(user.sub, param.id);
    await this.deceasedValidationService.validateCreateDeceasedMediaContent(dto, deceased);

    await this.constructAndCreateMediaContent(dto, deceased);

    await this.openSearchSyncService.updateDeceasedIndex(deceased);
  }

  private async constructAndCreateMediaContent(
    dto: CreateDeceasedMediaContentDto,
    deceased: TCreateDeceasedMediaContent,
  ): Promise<void> {
    const contentType = this.determineDeceasedContentType();

    await this.incrementMediaContentOrderForContentType(deceased.id, contentType);

    const mediaContentDto = this.constructMediaContentDto(dto, deceased, contentType);
    await this.createMediaContent(mediaContentDto);
  }

  private async createMediaContent(dto: IDeceasedMediaContent): Promise<void> {
    const newMediaContent = this.deceasedMediaContentRepository.create(dto);
    await this.deceasedMediaContentRepository.save(newMediaContent);
  }

  private async incrementMediaContentOrderForContentType(
    deceasedId: string,
    contentType: EDeceasedMediaContentType,
  ): Promise<void> {
    const orderField: keyof DeceasedMediaContent = 'order';
    await this.deceasedMediaContentRepository.increment({ deceased: { id: deceasedId }, contentType }, orderField, 1);
  }

  private determineDeceasedContentType(): EDeceasedMediaContentType {
    return EDeceasedMediaContentType.DECEASED_AVATAR;
  }

  private constructMediaContentDto(
    dto: CreateDeceasedMediaContentDto,
    deceased: TCreateDeceasedMediaContent,
    contentType: EDeceasedMediaContentType,
  ): IDeceasedMediaContent {
    const INITIAL_ORDER: number = 0;

    return {
      contentType,
      order: INITIAL_ORDER,
      file: { id: dto.id } as File,
      deceased,
    };
  }
}

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
  DeceasedSyncService,
  DeceasedValidationService,
} from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { TCreateDeceasedMediaContent } from 'src/modules/deceased/common/types';

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
    private readonly deceasedSyncService: DeceasedSyncService,
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

    await this.deceasedSyncService.updateDeceasedIndex(deceased.id);
  }

  private async constructAndCreateMediaContent(
    dto: CreateDeceasedMediaContentDto,
    deceased: TCreateDeceasedMediaContent,
  ): Promise<void> {
    const mediaContentDto = this.constructMediaContentDto(dto, deceased);
    await this.createMediaContent(mediaContentDto);
  }

  private async createMediaContent(dto: IDeceasedMediaContent): Promise<void> {
    const newMediaContent = this.deceasedMediaContentRepository.create(dto);
    await this.deceasedMediaContentRepository.save(newMediaContent);
  }

  private constructMediaContentDto(
    dto: CreateDeceasedMediaContentDto,
    deceased: TCreateDeceasedMediaContent,
  ): IDeceasedMediaContent {
    const isPrimary = !deceased.deceasedMediaContents.some((media) => media.isPrimary);

    return {
      contentType: EDeceasedMediaContentType.UPLOADED_PHOTO,
      isPrimary,
      file: { id: dto.id } as File,
      deceased,
    };
  }
}

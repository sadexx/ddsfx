import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUIDParamDto } from 'src/common/dto';
import { CreateDeceasedBiographyDto } from 'src/modules/deceased-highlights/common/dto';
import { DeceasedBiography } from 'src/modules/deceased-highlights/entities';
import { Repository } from 'typeorm';
import { IDeceasedBiography } from 'src/modules/deceased-highlights/common/interfaces';
import { Deceased } from 'src/modules/deceased/entities';
import {
  DeceasedHighLightsQueryOptionsService,
  DeceasedHighlightsValidationService,
} from 'src/modules/deceased-highlights/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TCreateDeceasedBiography, TGetDeceasedBiographies } from 'src/modules/deceased-highlights/common/types';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findManyTyped } from 'src/common/utils/find-many-typed';

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
    await this.deceasedHighlightsValidationService.validateCreateDeceasedBiography(deceased.id);

    await this.constructAndCreateDeceasedBiography(dto, deceased);
  }

  private async constructAndCreateDeceasedBiography(
    dto: CreateDeceasedBiographyDto,
    deceased: TCreateDeceasedBiography,
  ): Promise<DeceasedBiography> {
    const biographyDto = this.constructCreateDeceasedBiographyDto(dto, deceased);

    return await this.createBiography(biographyDto);
  }

  private async createBiography(dto: IDeceasedBiography): Promise<DeceasedBiography> {
    const newDeceasedBiography = this.deceasedBiographyRepository.create(dto);

    return await this.deceasedBiographyRepository.save(newDeceasedBiography);
  }

  private constructCreateDeceasedBiographyDto(
    dto: CreateDeceasedBiographyDto,
    deceased: TCreateDeceasedBiography,
  ): IDeceasedBiography {
    return {
      description: dto.description,
      deceased,
    };
  }
}

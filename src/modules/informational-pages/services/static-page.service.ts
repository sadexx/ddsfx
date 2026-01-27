import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaticPage } from 'src/modules/informational-pages/entities';
import { Repository } from 'typeorm';
import {
  CreateStaticPageDto,
  StaticPageParamDto,
  UpdateStaticPageDto,
} from 'src/modules/informational-pages/common/dto';
import { IStaticPage } from 'src/modules/informational-pages/common/interfaces';
import {
  InformationalPagesQueryOptionsService,
  InformationalPagesValidationService,
} from 'src/modules/informational-pages/services';
import { UUIDParamDto } from 'src/common/dto';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TGetStaticPage, TUpdateStaticPage } from 'src/modules/informational-pages/common/types';
import { StrictOmit } from 'src/common/types';

@Injectable()
export class StaticPageService {
  constructor(
    @InjectRepository(StaticPage)
    private readonly staticPageRepository: Repository<StaticPage>,
    private readonly informationalPagesQueryOptionsService: InformationalPagesQueryOptionsService,
    private readonly informationalPagesValidationService: InformationalPagesValidationService,
  ) {}

  public async getStaticPage(param: StaticPageParamDto): Promise<TGetStaticPage> {
    const queryOptions = this.informationalPagesQueryOptionsService.getStaticPageOptions(param.type);
    const staticPage = await findOneOrFailTyped<TGetStaticPage>(
      param.type,
      this.staticPageRepository,
      queryOptions,
      'type',
    );

    return staticPage;
  }

  public async createStaticPage(dto: CreateStaticPageDto): Promise<void> {
    await this.informationalPagesValidationService.validateCreateStaticPage(dto);

    await this.constructAndCreateStaticPage(dto);
  }

  public async updateStaticPage(param: UUIDParamDto, dto: UpdateStaticPageDto): Promise<void> {
    const queryOptions = this.informationalPagesQueryOptionsService.updateStaticPageOptions(param.id);
    const staticPage = await findOneOrFailTyped<TUpdateStaticPage>(param.id, this.staticPageRepository, queryOptions);

    await this.updatePage(dto, staticPage);
  }

  public async removeStaticPage(param: UUIDParamDto): Promise<void> {
    const result = await this.staticPageRepository.delete(param.id);

    if (!result.affected) {
      throw new NotFoundException(`Static page with id ${param.id} not found`);
    }
  }

  private async constructAndCreateStaticPage(dto: CreateStaticPageDto): Promise<void> {
    const staticPageDto = this.constructCreateStaticPageDto(dto);
    await this.saveStaticPage(staticPageDto);
  }

  private async saveStaticPage(dto: IStaticPage): Promise<void> {
    const newStaticPage = this.staticPageRepository.create(dto);
    await this.staticPageRepository.save(newStaticPage);
  }

  private async updatePage(dto: UpdateStaticPageDto, existingStaticPage: TUpdateStaticPage): Promise<void> {
    const staticPageDto = this.constructUpdateStaticPageDto(dto, existingStaticPage);
    await this.staticPageRepository.update({ id: existingStaticPage.id }, staticPageDto);
  }

  private constructCreateStaticPageDto(dto: CreateStaticPageDto): IStaticPage {
    return {
      type: dto.type,
      content: dto.content,
    };
  }

  private constructUpdateStaticPageDto(
    dto: UpdateStaticPageDto,
    existingStaticPage: TUpdateStaticPage,
  ): StrictOmit<IStaticPage, 'type'> {
    return {
      content: dto.content ?? existingStaticPage.content,
    };
  }
}

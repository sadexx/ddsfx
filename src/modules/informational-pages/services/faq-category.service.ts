import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqCategory } from 'src/modules/informational-pages/entities';
import { Repository } from 'typeorm';
import { CreateFaqCategoryDto, UpdateFaqCategoryDto } from 'src/modules/informational-pages/common/dto';
import { IFaqCategory } from 'src/modules/informational-pages/common/interfaces';
import {
  InformationalPagesQueryOptionsService,
  InformationalPagesValidationService,
} from 'src/modules/informational-pages/services';
import { UUIDParamDto } from 'src/common/dto';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TGetFaqCategories, TUpdateFaqCategory } from 'src/modules/informational-pages/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';

@Injectable()
export class FaqCategoryService {
  constructor(
    @InjectRepository(FaqCategory)
    private readonly faqCategoryRepository: Repository<FaqCategory>,
    private readonly informationalPagesQueryOptionsService: InformationalPagesQueryOptionsService,
    private readonly informationalPagesValidationService: InformationalPagesValidationService,
  ) {}

  public async getFaqCategories(): Promise<TGetFaqCategories[]> {
    const queryOptions = this.informationalPagesQueryOptionsService.getFaqCategoriesOptions();
    const faqCategories = await findManyTyped<TGetFaqCategories[]>(this.faqCategoryRepository, queryOptions);

    return faqCategories;
  }

  public async createFaqCategory(dto: CreateFaqCategoryDto): Promise<void> {
    await this.informationalPagesValidationService.validateCreateFaqCategory(this.faqCategoryRepository);

    await this.constructAndCreateFaqCategory(dto);
  }

  public async updateFaqCategory(param: UUIDParamDto, dto: UpdateFaqCategoryDto): Promise<void> {
    const queryOptions = this.informationalPagesQueryOptionsService.updateFaqCategoryOptions(param.id);
    const faqCategory = await findOneOrFailTyped<TUpdateFaqCategory>(
      param.id,
      this.faqCategoryRepository,
      queryOptions,
    );

    await this.updateCategory(dto, faqCategory);
  }

  public async removeFaqCategory(param: UUIDParamDto): Promise<void> {
    const result = await this.faqCategoryRepository.delete(param.id);

    if (!result.affected) {
      throw new NotFoundException(`Faq category with id ${param.id} not found`);
    }
  }

  private async constructAndCreateFaqCategory(dto: CreateFaqCategoryDto): Promise<void> {
    const faqCategoryDto = this.constructCreateFaqCategoryDto(dto);
    await this.saveFaqCategory(faqCategoryDto);
  }

  private async saveFaqCategory(dto: IFaqCategory): Promise<void> {
    const newFaqCategory = this.faqCategoryRepository.create(dto);
    await this.faqCategoryRepository.save(newFaqCategory);
  }

  private async updateCategory(dto: UpdateFaqCategoryDto, existingFaqCategory: TUpdateFaqCategory): Promise<void> {
    const faqCategoryDto = this.constructUpdateFaqCategoryDto(dto, existingFaqCategory);
    await this.faqCategoryRepository.update({ id: existingFaqCategory.id }, faqCategoryDto);
  }

  private constructCreateFaqCategoryDto(dto: CreateFaqCategoryDto): IFaqCategory {
    return {
      name: dto.name,
    };
  }

  private constructUpdateFaqCategoryDto(
    dto: UpdateFaqCategoryDto,
    existingFaqCategory: TUpdateFaqCategory,
  ): IFaqCategory {
    return {
      name: dto.name ?? existingFaqCategory.name,
    };
  }
}

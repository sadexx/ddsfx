import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqCategory, FaqItem } from 'src/modules/informational-pages/entities';
import { Repository } from 'typeorm';
import { CreateFaqItemDto, UpdateFaqItemDto } from 'src/modules/informational-pages/common/dto';
import { IFaqItem } from 'src/modules/informational-pages/common/interfaces';
import {
  InformationalPagesQueryOptionsService,
  InformationalPagesValidationService,
} from 'src/modules/informational-pages/services';
import { UUIDParamDto } from 'src/common/dto';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { TUpdateFaqItem } from 'src/modules/informational-pages/common/types';

@Injectable()
export class FaqItemService {
  constructor(
    @InjectRepository(FaqItem)
    private readonly faqItemRepository: Repository<FaqItem>,
    private readonly informationalPagesQueryOptionsService: InformationalPagesQueryOptionsService,
    private readonly informationalPagesValidationService: InformationalPagesValidationService,
  ) {}

  public async createFaqItem(dto: CreateFaqItemDto): Promise<void> {
    await this.informationalPagesValidationService.validateCreateFaqItem(dto, this.faqItemRepository);

    await this.constructAndCreateFaqItem(dto);
  }

  public async updateFaqItem(param: UUIDParamDto, dto: UpdateFaqItemDto): Promise<void> {
    const queryOptions = this.informationalPagesQueryOptionsService.updateFaqItemOptions(param.id);
    const faqItem = await findOneOrFailTyped<TUpdateFaqItem>(param.id, this.faqItemRepository, queryOptions);

    await this.informationalPagesValidationService.validateUpdateFaqItem(dto);

    await this.updateItem(dto, faqItem);
  }

  public async removeFaqItem(param: UUIDParamDto): Promise<void> {
    const result = await this.faqItemRepository.delete(param.id);

    if (!result.affected) {
      throw new NotFoundException(`Faq item with id ${param.id} not found`);
    }
  }

  private async constructAndCreateFaqItem(dto: CreateFaqItemDto): Promise<void> {
    const faqItemDto = this.constructCreateFaqItemDto(dto);
    await this.saveFaqItem(faqItemDto);
  }

  private async saveFaqItem(dto: IFaqItem): Promise<void> {
    const newFaqItem = this.faqItemRepository.create(dto);
    await this.faqItemRepository.save(newFaqItem);
  }

  private async updateItem(dto: UpdateFaqItemDto, existingFaqItem: TUpdateFaqItem): Promise<void> {
    const faqItemDto = this.constructUpdateFaqItemDto(dto, existingFaqItem);
    await this.faqItemRepository.update({ id: existingFaqItem.id }, faqItemDto);
  }

  private constructCreateFaqItemDto(dto: CreateFaqItemDto): IFaqItem {
    return {
      question: dto.question,
      answer: dto.answer,
      category: { id: dto.categoryId } as FaqCategory,
    };
  }

  private constructUpdateFaqItemDto(dto: UpdateFaqItemDto, existingFaqItem: TUpdateFaqItem): IFaqItem {
    return {
      question: dto.question ?? existingFaqItem.question,
      answer: dto.answer ?? existingFaqItem.answer,
      category: { id: dto.categoryId ?? existingFaqItem.category.id } as FaqCategory,
    };
  }
}

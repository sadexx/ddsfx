import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { ContactMethod, FaqCategory, FaqItem, StaticPage } from 'src/modules/informational-pages/entities';
import {
  CreateContactMethodDto,
  CreateFaqItemDto,
  CreateStaticPageDto,
  UpdateFaqItemDto,
} from 'src/modules/informational-pages/common/dto';
import { HelperService } from 'src/modules/helper/services';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InformationalPagesValidationService {
  private readonly INFORMATIONAL_PAGES_LIMIT: number = 20;
  constructor(
    @InjectRepository(FaqCategory)
    private readonly faqCategoryRepository: Repository<FaqCategory>,
    @InjectRepository(StaticPage)
    private readonly staticPageRepository: Repository<StaticPage>,
    private readonly helperService: HelperService,
  ) {}

  /**
   ** ContactMethodService
   */

  public async validateCreateContactMethod(
    dto: CreateContactMethodDto,
    repository: Repository<ContactMethod>,
  ): Promise<void> {
    await this.validateEntitiesLimit(repository);
    await this.helperService.ensureFilesExist([{ id: dto.fileId }]);
  }

  /**
   ** FaqCategoryService
   */

  public async validateCreateFaqCategory(repository: Repository<FaqCategory>): Promise<void> {
    await this.validateEntitiesLimit(repository);
  }

  /**
   ** FaqItemService
   */

  public async validateCreateFaqItem(dto: CreateFaqItemDto, repository: Repository<FaqItem>): Promise<void> {
    await this.ensureFaqCategoryExists(dto.categoryId);
    await this.validateEntitiesLimit(repository);
  }

  public async validateUpdateFaqItem(dto: UpdateFaqItemDto): Promise<void> {
    if (dto.categoryId) {
      await this.ensureFaqCategoryExists(dto.categoryId);
    }
  }

  private async ensureFaqCategoryExists(faqCategoryId: string): Promise<void> {
    const faqCategoryExists = await this.faqCategoryRepository.exists({ where: { id: faqCategoryId } });

    if (!faqCategoryExists) {
      throw new NotFoundException(`Faq category with id ${faqCategoryId} not found`);
    }
  }

  /**
   ** StaticPageService
   */

  public async validateCreateStaticPage(dto: CreateStaticPageDto): Promise<void> {
    const staticPageExists = await this.staticPageRepository.exists({ where: { type: dto.type } });

    if (staticPageExists) {
      throw new BadRequestException(`Static page with type ${dto.type} already exists`);
    }
  }

  /**
   ** Common helpers
   */

  private async validateEntitiesLimit<T extends ObjectLiteral>(repository: Repository<T>): Promise<void> {
    const existingCount = await repository.count();

    if (existingCount + 1 > this.INFORMATIONAL_PAGES_LIMIT) {
      throw new BadRequestException('Maximum number of entities reached');
    }
  }
}

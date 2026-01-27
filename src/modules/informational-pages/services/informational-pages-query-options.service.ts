import { Injectable } from '@nestjs/common';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { ContactMethod, FaqCategory, FaqItem, StaticPage } from 'src/modules/informational-pages/entities';
import {
  GetContactMethodsQuery,
  GetFaqCategoriesQuery,
  GetStaticPageQuery,
  UpdateContactMethodQuery,
  UpdateFaqCategoryQuery,
  UpdateFaqItemQuery,
  UpdateStaticPageQuery,
} from 'src/modules/informational-pages/common/types';
import { EStaticPageType } from 'src/modules/informational-pages/common/enums';

@Injectable()
export class InformationalPagesQueryOptionsService {
  /**
   ** ContactMethodService
   */

  public getContactMethodsOptions(): FindManyOptions<ContactMethod> {
    return {
      select: GetContactMethodsQuery.select,
      relations: GetContactMethodsQuery.relations,
    };
  }

  public updateContactMethodOptions(contactMethodId: string): FindOneOptions<ContactMethod> {
    return {
      select: UpdateContactMethodQuery.select,
      where: { id: contactMethodId },
      relations: UpdateContactMethodQuery.relations,
    };
  }

  /**
   ** FaqCategoryService
   */

  public getFaqCategoriesOptions(): FindManyOptions<FaqCategory> {
    return {
      select: GetFaqCategoriesQuery.select,
      relations: GetFaqCategoriesQuery.relations,
    };
  }

  public updateFaqCategoryOptions(faqCategoryId: string): FindOneOptions<FaqCategory> {
    return {
      select: UpdateFaqCategoryQuery.select,
      where: { id: faqCategoryId },
    };
  }

  /**
   ** FaqItemService
   */

  public updateFaqItemOptions(faqItemId: string): FindOneOptions<FaqItem> {
    return {
      select: UpdateFaqItemQuery.select,
      where: { id: faqItemId },
    };
  }

  /**
   ** StaticPageService
   */

  public getStaticPageOptions(type: EStaticPageType): FindManyOptions<StaticPage> {
    return {
      select: GetStaticPageQuery.select,
      where: { type: type },
    };
  }

  public updateStaticPageOptions(staticPageId: string): FindManyOptions<StaticPage> {
    return {
      select: UpdateStaticPageQuery.select,
      where: { id: staticPageId },
    };
  }
}

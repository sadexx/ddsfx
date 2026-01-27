import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMethod, FaqCategory, FaqItem, StaticPage } from 'src/modules/informational-pages/entities';
import {
  ContactMethodService,
  FaqCategoryService,
  FaqItemService,
  InformationalPagesQueryOptionsService,
  InformationalPagesValidationService,
  StaticPageService,
} from 'src/modules/informational-pages/services';
import { HelperModule } from 'src/modules/helper/helper.module';
import {
  ContactMethodController,
  FaqCategoryController,
  FaqItemController,
  StaticPageController,
} from 'src/modules/informational-pages/controllers';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMethod, FaqCategory, FaqItem, StaticPage]), HelperModule],
  controllers: [ContactMethodController, FaqCategoryController, FaqItemController, StaticPageController],
  providers: [
    InformationalPagesQueryOptionsService,
    InformationalPagesValidationService,
    ContactMethodService,
    FaqCategoryService,
    FaqItemService,
    StaticPageService,
  ],
})
export class InformationalPagesModule {}

import { Controller, Param, UseGuards, Post, Body, Patch, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { FaqCategoryService } from 'src/modules/informational-pages/services';
import { TGetFaqCategories } from 'src/modules/informational-pages/common/types';
import { CreateFaqCategoryDto, UpdateFaqCategoryDto } from 'src/modules/informational-pages/common/dto';

@Controller('info-pages/faq-categories')
export class FaqCategoryController {
  constructor(private readonly faqCategoryService: FaqCategoryService) {}

  @Get()
  async getFaqCategories(): Promise<TGetFaqCategories[]> {
    return this.faqCategoryService.getFaqCategories();
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateFaqCategoryDto.schema })
  async createFaqCategory(@Body() dto: CreateFaqCategoryDto): Promise<void> {
    return this.faqCategoryService.createFaqCategory(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateFaqCategoryDto.schema })
  async updateFaqCategory(@Param() param: UUIDParamDto, @Body() dto: UpdateFaqCategoryDto): Promise<void> {
    return this.faqCategoryService.updateFaqCategory(param, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFaqCategory(@Param() param: UUIDParamDto): Promise<void> {
    return this.faqCategoryService.removeFaqCategory(param);
  }
}

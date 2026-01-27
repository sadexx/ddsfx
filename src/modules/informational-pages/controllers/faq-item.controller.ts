import {
  Controller,
  Param,
  UseGuards,
  Post,
  Body,
  Patch,
  Delete,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { NotEmptyBodyPipe } from 'src/common/pipes';
import { FaqItemService } from 'src/modules/informational-pages/services';
import { CreateFaqItemDto, UpdateFaqItemDto } from 'src/modules/informational-pages/common/dto';

@Controller('info-pages/faq-items')
export class FaqItemController {
  constructor(private readonly faqItemService: FaqItemService) {}

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateFaqItemDto.schema })
  async createFaqItem(@Body() dto: CreateFaqItemDto): Promise<void> {
    return this.faqItemService.createFaqItem(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateFaqItemDto.schema })
  async updateFaqItem(@Param() param: UUIDParamDto, @Body() dto: UpdateFaqItemDto): Promise<void> {
    return this.faqItemService.updateFaqItem(param, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFaqItem(@Param() param: UUIDParamDto): Promise<void> {
    return this.faqItemService.removeFaqItem(param);
  }
}

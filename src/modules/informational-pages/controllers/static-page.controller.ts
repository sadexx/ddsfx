import { Controller, Param, UseGuards, Post, Body, Patch, Delete, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { StaticPageService } from 'src/modules/informational-pages/services';
import { TGetStaticPage } from 'src/modules/informational-pages/common/types';
import {
  CreateStaticPageDto,
  StaticPageParamDto,
  UpdateStaticPageDto,
} from 'src/modules/informational-pages/common/dto';

@Controller('info-pages/static-pages')
export class StaticPageController {
  constructor(private readonly staticPageService: StaticPageService) {}

  @Get('/:type')
  @RouteSchema({ params: StaticPageParamDto.schema })
  async getStaticPage(@Param() param: StaticPageParamDto): Promise<TGetStaticPage> {
    return this.staticPageService.getStaticPage(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateStaticPageDto.schema })
  async createStaticPage(@Body() dto: CreateStaticPageDto): Promise<void> {
    return this.staticPageService.createStaticPage(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateStaticPageDto.schema })
  async updateStaticPage(@Param() param: UUIDParamDto, @Body() dto: UpdateStaticPageDto): Promise<void> {
    return this.staticPageService.updateStaticPage(param, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeContactMethod(@Param() param: UUIDParamDto): Promise<void> {
    return this.staticPageService.removeStaticPage(param);
  }
}

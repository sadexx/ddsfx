import { Controller, UseGuards, Post, Body, Get, Query } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { CreateReferenceCatalogDto, GetReferenceCatalogsDto } from 'src/modules/reference-catalog/common/dto';
import { ReferenceCatalogService } from 'src/modules/reference-catalog/services';
import { TGetReferenceCatalogs } from 'src/modules/reference-catalog/common/types';
import { EntityIdOutput } from 'src/common/outputs';

@Controller('reference-catalogs')
export class ReferenceCatalogController {
  constructor(private readonly referenceCatalogService: ReferenceCatalogService) {}

  @UseGuards(JwtFullAccessGuard)
  @RouteSchema({ querystring: GetReferenceCatalogsDto.schema })
  @Get()
  async getReferenceCatalogs(@Query() dto: GetReferenceCatalogsDto): Promise<TGetReferenceCatalogs[]> {
    return this.referenceCatalogService.getReferenceCatalogs(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateReferenceCatalogDto.schema })
  async createReferenceCatalog(@Body() dto: CreateReferenceCatalogDto): Promise<EntityIdOutput> {
    return this.referenceCatalogService.createReferenceCatalog(dto);
  }
}

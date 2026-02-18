import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CemeteryService } from 'src/modules/cemetery/services';
import { CreateCemeteryDto, GetCemeteriesDto } from 'src/modules/cemetery/common/dto';
import { RouteSchema } from '@nestjs/platform-fastify';
import { TGetCemeteries } from 'src/modules/cemetery/common/types';
import { EntityIdOutput } from 'src/common/outputs';

@Controller('cemeteries')
export class CemeteryController {
  constructor(private readonly cemeteryService: CemeteryService) {}

  @Get()
  @RouteSchema({ querystring: GetCemeteriesDto.schema })
  async getCemeteries(@Query() dto: GetCemeteriesDto): Promise<TGetCemeteries[]> {
    return this.cemeteryService.getCemeteries(dto);
  }

  @Post()
  @RouteSchema({ body: CreateCemeteryDto.schema })
  async createCemetery(@Body() dto: CreateCemeteryDto): Promise<EntityIdOutput> {
    return this.cemeteryService.createCemetery(dto);
  }
}

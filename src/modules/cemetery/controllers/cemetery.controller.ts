import { Controller, Get, Query } from '@nestjs/common';
import { CemeteryService } from 'src/modules/cemetery/services';
import { GetCemeteriesDto } from 'src/modules/cemetery/common/dto';
import { RouteSchema } from '@nestjs/platform-fastify';
import { PaginationOutput } from 'src/common/outputs';
import { TGetCemeteries } from 'src/modules/cemetery/common/types';

@Controller('cemeteries')
export class CemeteryController {
  constructor(private readonly cemeteryService: CemeteryService) {}

  @Get()
  @RouteSchema({ querystring: GetCemeteriesDto.schema })
  async getCemeteries(@Query() dto: GetCemeteriesDto): Promise<PaginationOutput<TGetCemeteries>> {
    return this.cemeteryService.getCemeteries(dto);
  }
}

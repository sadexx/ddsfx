import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CemeteryService } from 'src/modules/cemetery/services';
import { GetCemeteriesDto } from 'src/modules/cemetery/common/dto';
import { RouteSchema } from '@nestjs/platform-fastify';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { PaginationOutput } from 'src/common/outputs';
import { TGetCemeteries } from 'src/modules/cemetery/common/types';

@Controller('cemeteries')
export class CemeteryController {
  constructor(private readonly cemeteryService: CemeteryService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get()
  @RouteSchema({ querystring: GetCemeteriesDto.schema })
  async getDeceased(@Query() dto: GetCemeteriesDto): Promise<PaginationOutput<TGetCemeteries>> {
    return this.cemeteryService.getCemeteries(dto);
  }
}

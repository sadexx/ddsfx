import { Controller, Get, Query } from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { SearchEngineLogicService } from 'src/modules/search-engine-logic/services';
import { GetFamousDeceasedDto, SearchQueryDto } from 'src/modules/search-engine-logic/common/dto';
import { IPersonOutput } from 'src/modules/search-engine-logic/common/output';
import { ClientInfoValidationPipe } from 'src/common/pipes';
import { ClientInfo } from 'src/common/decorators';
import { IClientInfo } from 'src/common/interfaces';
import { TLoadDeceasedWithRelations } from 'src/modules/external-sync/common/types';

@Controller('search-engine-logic')
export class SearchEngineLogicController {
  constructor(private readonly searchService: SearchEngineLogicService) {}

  @Get('search')
  @RouteSchema({ querystring: SearchQueryDto })
  public async searchByQuery(
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Query() dto: SearchQueryDto,
  ): Promise<IPersonOutput[]> {
    return await this.searchService.launchSearch(dto, clientInfo);
  }

  @Get('famous-deceased-profile')
  @RouteSchema({ querystring: GetFamousDeceasedDto })
  async getFamousDeceasedProfile(@Query() dto: GetFamousDeceasedDto): Promise<TLoadDeceasedWithRelations[]> {
    return this.searchService.getFamousDeceasedProfile(dto);
  }
}

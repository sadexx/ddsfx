import { Controller, Delete, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { SearchEngineLogicService } from 'src/modules/search-engine-logic/services';
import { SearchQueryDto } from 'src/modules/search-engine-logic/common/dto';
import { IPersonOutput } from 'src/modules/search-engine-logic/common/output';
import { MessageOutput } from 'src/common/outputs';
import { ClientInfoValidationPipe } from 'src/common/pipes';
import { ClientInfo } from 'src/common/decorators';
import { IClientInfo } from 'src/common/interfaces';

@Controller('search-engine-logic')
export class SearchEngineLogicController {
  constructor(private readonly searchService: SearchEngineLogicService) {}

  @Get('create-seed-data-memory')
  @RouteSchema({ response: { 200: MessageOutput.schema } })
  async createMemorySeedData(): Promise<MessageOutput> {
    return this.searchService.createMemorySeedData();
  }

  @Get('search')
  @RouteSchema({ querystring: SearchQueryDto })
  public async searchByQuery(
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Query() dto: SearchQueryDto,
  ): Promise<IPersonOutput[]> {
    return await this.searchService.launchSearch(dto, clientInfo);
  }

  @Delete('seed-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSeedData(): Promise<void> {
    return this.searchService.deleteSeedData();
  }
}

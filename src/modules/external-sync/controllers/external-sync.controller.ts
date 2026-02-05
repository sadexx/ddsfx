import { Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ExternalSyncService } from 'src/modules/external-sync/services/external-sync.service';

@Controller('external-sync')
export class ExternalSyncController {
  constructor(private readonly externalSyncService: ExternalSyncService) {}

  @Post('sync-memory-data')
  public async syncMemoryData(): Promise<void> {
    await this.externalSyncService.syncMemoryDataToPostgres();
  }

  @Post('sync-city-data')
  public async syncCityData(): Promise<void> {
    await this.externalSyncService.syncCityDataToOpenSearch();
  }

  @Delete('open-search-index')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOpenSearchIndex(): Promise<void> {
    return this.externalSyncService.deleteOpenSearchIndex();
  }
}

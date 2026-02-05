import { Injectable } from '@nestjs/common';
import { LokiLogger } from 'src/libs/logger';
import { MemorySyncService } from 'src/modules/external-sync/services/memory-sync.service';
import { DeceasedCreationService } from 'src/modules/external-sync/services/deceased-creation.service';
import { OpenSearchSyncService } from 'src/modules/external-sync/services/opensearch-sync.service';
import { EOpenSearchIndexType } from 'src/libs/opensearch/common/enums';

@Injectable()
export class ExternalSyncService {
  private readonly lokiLogger = new LokiLogger(ExternalSyncService.name);

  constructor(
    private readonly memorySyncService: MemorySyncService,
    private readonly deceasedCreationService: DeceasedCreationService,
    private readonly openSearchSyncService: OpenSearchSyncService,
  ) {}

  public async syncMemoryDataToPostgres(): Promise<void> {
    try {
      this.lokiLogger.log('Seeding people data from memory...');

      const dataSets = await this.memorySyncService.generateMemoryDatasets();

      for (const dataSet of dataSets) {
        await this.deceasedCreationService.createDeceasedFromMemory(dataSet);
      }

      this.lokiLogger.log(`Successfully seeded ${dataSets.length} deceased records from memory`);
    } catch (error) {
      this.lokiLogger.error('Failed to seed data from memory:', (error as Error).message);
      throw error;
    }
  }

  public async syncCityDataToOpenSearch(): Promise<void> {
    try {
      this.lokiLogger.log('Seeding people data from city...');

      await this.openSearchSyncService.initializePeopleIndex();

      const dataSets = await this.openSearchSyncService.generateCityDatasets();
      await this.openSearchSyncService.bulkIndexPeople(dataSets);
      this.lokiLogger.log(`Successfully seeded ${dataSets.length} people records from city`);
    } catch (error) {
      this.lokiLogger.error('Failed to seed data from city:', (error as Error).message);
      throw error;
    }
  }

  public async deleteOpenSearchIndex(): Promise<void> {
    const count = await this.openSearchSyncService.countDocumentsInOpenSearch();

    if (count > 0) {
      this.lokiLogger.log(`Index ${EOpenSearchIndexType.PEOPLE} contains ${count} documents, deleting...`);

      await this.openSearchSyncService.deleteOpenSearchIndex();
    }

    return;
  }
}

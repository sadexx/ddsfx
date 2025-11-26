import { Module } from '@nestjs/common';
import { SearchEngineLogicController } from 'src/modules/search-engine-logic/controllers';
import { SearchEngineLogicService, SearchEngineQueryOptionsService } from 'src/modules/search-engine-logic/services';
import { ExternalSyncModule } from 'src/modules/external-sync/external-sync.module';
import { SettingsModule } from 'src/modules/settings/settings.module';

@Module({
  imports: [ExternalSyncModule, SettingsModule],
  controllers: [SearchEngineLogicController],
  providers: [SearchEngineLogicService, SearchEngineQueryOptionsService],
  exports: [SearchEngineLogicService],
})
export class SearchEngineLogicModule {}

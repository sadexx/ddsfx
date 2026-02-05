import { Module } from '@nestjs/common';
import { SearchEngineLogicController } from 'src/modules/search-engine-logic/controllers';
import { SearchEngineLogicService, SearchEngineQueryOptionsService } from 'src/modules/search-engine-logic/services';
import { SettingsModule } from 'src/modules/settings/settings.module';

@Module({
  imports: [SettingsModule],
  controllers: [SearchEngineLogicController],
  providers: [SearchEngineLogicService, SearchEngineQueryOptionsService],
  exports: [SearchEngineLogicService],
})
export class SearchEngineLogicModule {}

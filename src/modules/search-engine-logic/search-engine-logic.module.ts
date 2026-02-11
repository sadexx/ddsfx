import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { HelperModule } from 'src/modules/helper/helper.module';
import { SearchEngineLogicController } from 'src/modules/search-engine-logic/controllers';
import { SearchEngineLogicService, SearchEngineQueryOptionsService } from 'src/modules/search-engine-logic/services';

@Module({
  imports: [TypeOrmModule.forFeature([Deceased]), SettingsModule, HelperModule],
  controllers: [SearchEngineLogicController],
  providers: [SearchEngineLogicService, SearchEngineQueryOptionsService],
  exports: [SearchEngineLogicService],
})
export class SearchEngineLogicModule {}

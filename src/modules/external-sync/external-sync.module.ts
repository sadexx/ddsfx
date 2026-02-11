import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { HelperModule } from 'src/modules/helper/helper.module';
import { ExternalSyncController } from 'src/modules/external-sync/controllers';
import {
  DeceasedCreationService,
  ExternalSyncService,
  MemorySyncService,
  OpenSearchSyncService,
} from 'src/modules/external-sync/services';

@Module({
  imports: [TypeOrmModule.forFeature([Deceased]), HelperModule],
  controllers: [ExternalSyncController],
  providers: [DeceasedCreationService, ExternalSyncService, MemorySyncService, OpenSearchSyncService],
  exports: [ExternalSyncService, OpenSearchSyncService],
})
export class ExternalSyncModule {}

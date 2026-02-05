import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deceased } from 'src/modules/deceased/entities';
import { ExternalSyncController } from 'src/modules/external-sync/controllers';
import {
  DeceasedCreationService,
  ExternalSyncQueryOptionsService,
  ExternalSyncService,
  MemorySyncService,
  OpenSearchSyncService,
} from 'src/modules/external-sync/services';

@Module({
  imports: [TypeOrmModule.forFeature([Deceased])],
  controllers: [ExternalSyncController],
  providers: [
    DeceasedCreationService,
    ExternalSyncService,
    MemorySyncService,
    OpenSearchSyncService,
    ExternalSyncQueryOptionsService,
  ],
  exports: [ExternalSyncService, OpenSearchSyncService],
})
export class ExternalSyncModule {}

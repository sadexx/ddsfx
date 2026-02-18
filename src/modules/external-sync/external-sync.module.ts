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
import { FreyaPostsModule } from 'src/modules/freya-posts/freya-posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deceased]), HelperModule, FreyaPostsModule],
  controllers: [ExternalSyncController],
  providers: [DeceasedCreationService, ExternalSyncService, MemorySyncService, OpenSearchSyncService],
  exports: [ExternalSyncService, OpenSearchSyncService],
})
export class ExternalSyncModule {}

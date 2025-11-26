import { Module } from '@nestjs/common';
import { ExternalSyncService } from 'src/modules/external-sync/services';

@Module({
  imports: [],
  controllers: [],
  providers: [ExternalSyncService],
  exports: [ExternalSyncService],
})
export class ExternalSyncModule {}

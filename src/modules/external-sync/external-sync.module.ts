import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalSyncService } from 'src/modules/external-sync/services';
import { Deceased } from 'src/modules/deceased/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Deceased])],
  controllers: [],
  providers: [ExternalSyncService],
  exports: [ExternalSyncService],
})
export class ExternalSyncModule {}

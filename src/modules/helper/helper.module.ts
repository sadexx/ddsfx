import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/libs/file-management/entities';
import { HelperQueryService, HelperService } from 'src/modules/helper/services';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

@Module({
  imports: [TypeOrmModule.forFeature([File, ReferenceCatalog])],
  providers: [HelperService, HelperQueryService],
  exports: [HelperService, HelperQueryService],
})
export class HelperModule {}

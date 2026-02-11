import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from 'src/modules/helper/helper.module';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';
import { ReferenceCatalogController } from 'src/modules/reference-catalog/controllers';
import { ReferenceCatalogService } from 'src/modules/reference-catalog/services';

@Module({
  imports: [TypeOrmModule.forFeature([ReferenceCatalog]), HelperModule],
  controllers: [ReferenceCatalogController],
  providers: [ReferenceCatalogService],
})
export class ReferenceCatalogModule {}

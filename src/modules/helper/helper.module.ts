import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/libs/file-management/entities';
import { HelperService } from 'src/modules/helper/services';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [HelperService],
  exports: [HelperService],
})
export class HelperModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { FreyaPostService } from 'src/modules/freya-posts/services';
import { User } from 'src/modules/users/entities';
import { FileManagementModule } from 'src/libs/file-management/file-management.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), SettingsModule, FileManagementModule],
  controllers: [],
  providers: [FreyaPostService],
  exports: [FreyaPostService],
})
export class FreyaPostsModule {}

import { Module } from '@nestjs/common';
import { AppInitializerService } from 'src/libs/app-initializer/services';
import { SettingsModule } from 'src/modules/settings/settings.module';
import { UsersModule } from 'src/modules/users/users.module';
import { CemeteryModule } from 'src/modules/cemetery/cemetery.module';
import { FreyaPostsModule } from 'src/modules/freya-posts/freya-posts.module';

@Module({
  imports: [SettingsModule, UsersModule, CemeteryModule, FreyaPostsModule],
  providers: [AppInitializerService],
  exports: [AppInitializerService],
})
export class AppInitializerModule {}

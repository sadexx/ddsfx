import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, PostMediaContent, PostTemplate } from 'src/modules/posts/entities';
import { Deceased } from 'src/modules/deceased/entities';
import { File } from 'src/libs/file-management/entities';
import { HelperModule } from 'src/modules/helper/helper.module';
import { PostController, PostTemplateController } from 'src/modules/posts/controllers';
import {
  PostMediaContentService,
  PostValidationService,
  PostService,
  PostTemplateService,
} from 'src/modules/posts/services';
import { DeceasedModule } from 'src/modules/deceased/deceased.module';
import { FileManagementModule } from 'src/libs/file-management/file-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostMediaContent, Deceased, File, PostTemplate]),
    HelperModule,
    DeceasedModule,
    FileManagementModule,
  ],
  controllers: [PostController, PostTemplateController],
  providers: [PostMediaContentService, PostValidationService, PostService, PostTemplateService],
  exports: [],
})
export class PostsModule {}

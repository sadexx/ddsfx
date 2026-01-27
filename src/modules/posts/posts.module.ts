import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, PostMediaContent } from 'src/modules/posts/entities';
import { Deceased } from 'src/modules/deceased/entities';
import { File } from 'src/libs/file-management/entities';
import { HelperModule } from 'src/modules/helper/helper.module';
import { PostController } from 'src/modules/posts/controllers';
import { PostMediaContentService, PostValidationService, PostService } from 'src/modules/posts/services';
import { DeceasedModule } from 'src/modules/deceased/deceased.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostMediaContent, Deceased, File]), HelperModule, DeceasedModule],
  controllers: [PostController],
  providers: [PostMediaContentService, PostValidationService, PostService],
  exports: [],
})
export class PostsModule {}

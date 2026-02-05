import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostMediaContent } from 'src/modules/posts/entities';
import { CreatePostMediaContentDto } from 'src/modules/posts/common/dto';
import { EPostMediaContentType } from 'src/modules/posts/common/enums';

@Injectable()
export class PostMediaContentService {
  constructor(
    @InjectRepository(PostMediaContent)
    private readonly postMediaContentRepository: Repository<PostMediaContent>,
  ) {}

  public async createPostMediaContents(postId: string, mediaContents: CreatePostMediaContentDto[]): Promise<void> {
    const postMediaContentDto = mediaContents.map((mediaContent) =>
      this.buildPostMediaContentEntity(EPostMediaContentType.POST_MEDIA, postId, mediaContent.id, mediaContent.order),
    );
    await this.postMediaContentRepository.save(postMediaContentDto);
  }

  public async createPostTemplateMediaContent(postId: string, fileId: string): Promise<void> {
    const postMediaContentDto = this.buildPostMediaContentEntity(EPostMediaContentType.POST_TEMPLATE, postId, fileId);
    await this.postMediaContentRepository.save(postMediaContentDto);
  }

  private buildPostMediaContentEntity(
    contentType: EPostMediaContentType,
    postId: string,
    fileId: string,
    order: number = 0,
  ): PostMediaContent {
    return this.postMediaContentRepository.create({
      contentType,
      post: { id: postId },
      file: { id: fileId },
      order,
    });
  }
}

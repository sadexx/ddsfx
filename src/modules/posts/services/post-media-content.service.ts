import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostMediaContent } from 'src/modules/posts/entities';
import { CreatePostMediaContentDto } from 'src/modules/posts/common/dto';

@Injectable()
export class PostMediaContentService {
  constructor(
    @InjectRepository(PostMediaContent)
    private readonly postMediaContentRepository: Repository<PostMediaContent>,
  ) {}

  public async createPostMediaContents(postId: string, mediaContents: CreatePostMediaContentDto[]): Promise<void> {
    const postMediaContentDto = mediaContents.map((mediaContent) =>
      this.buildPostMediaContentEntity(postId, mediaContent),
    );
    await this.postMediaContentRepository.save(postMediaContentDto);
  }

  private buildPostMediaContentEntity(postId: string, mediaContent: CreatePostMediaContentDto): PostMediaContent {
    return this.postMediaContentRepository.create({
      post: { id: postId },
      file: { id: mediaContent.id },
      order: mediaContent.order,
    });
  }
}

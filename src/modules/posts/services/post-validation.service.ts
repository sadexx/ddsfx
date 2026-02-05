import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from 'src/modules/posts/entities';
import { Deceased } from 'src/modules/deceased/entities';
import { NUMBER_OF_HOURS_IN_DAY, NUMBER_OF_MILLISECONDS_IN_HOUR } from 'src/common/constants';
import { TUpdatePost } from 'src/modules/posts/common/types';
import { UpdatePostDto } from 'src/modules/posts/common/dto';

@Injectable()
export class PostValidationService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
  ) {}

  public async ensureDeceasedExists(deceasedId: string): Promise<void> {
    const deceased = await this.deceasedRepository.exists({ where: { id: deceasedId } });

    if (!deceased) {
      throw new NotFoundException(`Deceased not found`);
    }
  }

  public async ensureReplyPostExists(postId: string): Promise<void> {
    const post = await this.postsRepository.exists({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }
  }

  public updatePostRestrictions(post: TUpdatePost, dto: UpdatePostDto): void {
    const twentyFourHoursAgo = new Date(Date.now() - NUMBER_OF_MILLISECONDS_IN_HOUR * NUMBER_OF_HOURS_IN_DAY);

    if (post.creationDate < twentyFourHoursAgo) {
      throw new NotFoundException(`Post cannot be updated after ${NUMBER_OF_HOURS_IN_DAY} hours of creation`);
    }

    if (dto.text === null && post.mediaContent.length === 0) {
      throw new NotFoundException(`Post cannot be updated with empty text and no media content`);
    }
  }
}

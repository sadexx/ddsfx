import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { Post } from 'src/modules/posts/entities';
import { PostMediaContentService } from 'src/modules/posts/services/post-media-content.service';
import { PostValidationService } from 'src/modules/posts/services/post-validation.service';
import { HelperService } from 'src/modules/helper/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { CreatePostDto, UpdatePostDto } from 'src/modules/posts/common/dto';
import { ESortOrder } from 'src/common/enums';
import { MessageOutput } from 'src/common/outputs';
import { PaginationCursorQueryDto } from 'src/common/dto';
import {
  DeletePostQuery,
  GetPostQuery,
  TDeletePost,
  TGetPost,
  TUpdatePost,
  UpdatePostQuery,
} from 'src/modules/posts/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { GetAllPostsOutput } from 'src/modules/posts/common/outputs';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly postMediaContentService: PostMediaContentService,
    private readonly postValidationService: PostValidationService,
    private readonly helperService: HelperService,
  ) {}

  public async findAll(deceasedId: string, dto: PaginationCursorQueryDto): Promise<GetAllPostsOutput> {
    const whereConditions: FindOptionsWhere<Post> = {
      deceased: { id: deceasedId },
    };

    if (dto.cursor) {
      whereConditions.creationDate = LessThan(dto.cursor);
    }

    const posts = await findManyTyped<TGetPost[]>(this.postsRepository, {
      select: GetPostQuery.select,
      where: whereConditions,
      relations: GetPostQuery.relations,
      take: dto.limit,
      order: { creationDate: ESortOrder.DESC },
    });

    const lastPost = posts.at(-1);
    const nextCursor = posts.length === dto.limit && lastPost ? lastPost.creationDate : null;

    return { data: posts, nextCursor: nextCursor };
  }

  public async getById(postId: string): Promise<TGetPost> {
    return await findOneOrFailTyped<TGetPost>(postId, this.postsRepository, {
      select: GetPostQuery.select,
      where: { id: postId },
      relations: GetPostQuery.relations,
    });
  }

  public async createPost(deceasedId: string, user: ITokenUserPayload, dto: CreatePostDto): Promise<MessageOutput> {
    await this.postValidationService.ensureDeceasedExists(deceasedId);

    if (dto.mediaContent && dto.mediaContent.length > 0) {
      await this.helperService.ensureFilesExist(dto.mediaContent);
    }

    if (dto.replyToPostId) {
      await this.postValidationService.ensureReplyPostExists(dto.replyToPostId);
    }

    const post = this.postsRepository.create({
      user: { id: user.sub },
      deceased: { id: deceasedId },
      replyToPost: dto.replyToPostId ? { id: dto.replyToPostId } : null,
      text: dto.text ? dto.text : null,
    });

    await this.postsRepository.save(post);

    if (dto.mediaContent && dto.mediaContent.length > 0) {
      await this.postMediaContentService.createPostMediaContents(post.id, dto.mediaContent);
    }

    return { message: 'Post created successfully' };
  }

  public async updatePost(postId: string, user: ITokenUserPayload, dto: UpdatePostDto): Promise<MessageOutput> {
    const post = await findOneOrFailTyped<TUpdatePost>(postId, this.postsRepository, {
      select: UpdatePostQuery.select,
      where: { id: postId, user: { id: user.sub } },
      relations: UpdatePostQuery.relations,
    });

    this.postValidationService.updatePostRestrictions(post, dto);

    await this.postsRepository.update(post.id, { text: dto.text });

    return { message: 'Post updated successfully' };
  }

  public async deletePost(postId: string, user: ITokenUserPayload): Promise<void> {
    const post = await findOneOrFailTyped<TDeletePost>(postId, this.postsRepository, {
      select: DeletePostQuery.select,
      where: { id: postId, user: { id: user.sub } },
      relations: DeletePostQuery.relations,
    });
    await this.postsRepository.delete(post.id);
  }
}

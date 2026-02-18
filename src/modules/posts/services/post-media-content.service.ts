import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostMediaContent, PostTemplate } from 'src/modules/posts/entities';
import { CreatePostMediaContentDto } from 'src/modules/posts/common/dto';
import { EPostMediaContentType } from 'src/modules/posts/common/enums';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { ApplyPostTemplateQuery, TApplyPostTemplate } from '../common/types';
import { FileManagementService } from 'src/libs/file-management/services';
import { EFileType } from 'src/libs/file-management/common/enums';
import { EntityIdOutput } from 'src/common/outputs';

@Injectable()
export class PostMediaContentService {
  constructor(
    @InjectRepository(PostMediaContent)
    private readonly postMediaContentRepository: Repository<PostMediaContent>,
    @InjectRepository(PostTemplate)
    private readonly postTemplateRepository: Repository<PostTemplate>,
    private readonly fileManagementService: FileManagementService,
  ) {}

  public async createPostMediaContents(
    postId: string,
    mediaContents: CreatePostMediaContentDto[],
    user: ITokenUserPayload,
  ): Promise<void> {
    const postMediaContentDto: PostMediaContent[] = [];

    for (const content of mediaContents) {
      if (content.id) {
        const postMediaContent = this.buildPostMediaContentEntity(
          EPostMediaContentType.POST_MEDIA,
          postId,
          content.id,
          content.order,
        );

        postMediaContentDto.push(postMediaContent);
      }

      if (content.templateId) {
        const file = await this.applyPostTemplate(content.templateId, user);
        const postMediaContent = this.buildPostMediaContentEntity(
          EPostMediaContentType.POST_TEMPLATE,
          postId,
          file.id,
          content.order,
        );

        postMediaContentDto.push(postMediaContent);
      }
    }

    await this.postMediaContentRepository.save(postMediaContentDto);
  }

  private async applyPostTemplate(id: string, user: ITokenUserPayload): Promise<EntityIdOutput> {
    const template = await findOneOrFailTyped<TApplyPostTemplate>(id, this.postTemplateRepository, {
      select: ApplyPostTemplateQuery.select,
      where: { id, isActive: true },
      relations: ApplyPostTemplateQuery.relations,
    });

    return await this.fileManagementService.copyFile(template.file.id, user, EFileType.POST_PHOTOS);
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
      order: order,
    });
  }
}

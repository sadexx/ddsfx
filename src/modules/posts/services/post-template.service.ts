import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostMediaContent, PostTemplate } from 'src/modules/posts/entities';
import { Repository } from 'typeorm';
import {
  ApplyPostTemplateQuery,
  GetPostTemplatesQuery,
  TApplyPostTemplate,
  TGetPostTemplates,
  TUpdatePostTemplate,
  UpdatePostTemplateQuery,
} from 'src/modules/posts/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { findOneOrFailTyped, findOneTyped } from 'src/common/utils/find-one-typed';
import { EFileType } from 'src/libs/file-management/common/enums';
import { PostMediaContentService } from 'src/modules/posts/services';
import { CreatePostTemplateDto } from 'src/modules/posts/common/dto';
import { EPostMediaContentType } from 'src/modules/posts/common/enums';
import { FileManagementService } from 'src/libs/file-management/services';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class PostTemplateService {
  constructor(
    @InjectRepository(PostTemplate)
    private readonly postTemplateRepository: Repository<PostTemplate>,
    @InjectRepository(PostMediaContent)
    private readonly postMediaContentRepository: Repository<PostMediaContent>,
    private readonly postMediaContentService: PostMediaContentService,
    private readonly fileManagementService: FileManagementService,
  ) {}

  public async getPostTemplates(): Promise<TGetPostTemplates[]> {
    const postTemplates = await findManyTyped<TGetPostTemplates[]>(this.postTemplateRepository, {
      select: GetPostTemplatesQuery.select,
      where: { isActive: true },
      relations: GetPostTemplatesQuery.relations,
    });

    return postTemplates;
  }

  public async createPostTemplate(dto: CreatePostTemplateDto): Promise<void> {
    const postTemplate = this.buildPostTemplateEntity(dto);
    await this.postTemplateRepository.save(postTemplate);
  }

  public async updatePostTemplate(id: string, postId: string, user: ITokenUserPayload): Promise<void> {
    const postMediaContent = await findOneTyped<TUpdatePostTemplate>(this.postMediaContentRepository, {
      select: UpdatePostTemplateQuery.select,
      where: { id: postId, contentType: EPostMediaContentType.POST_TEMPLATE },
      relations: UpdatePostTemplateQuery.relations,
    });

    if (postMediaContent) {
      await this.fileManagementService.deleteFileAndObject(postMediaContent.file);
    }

    await this.applyPostTemplate(id, postId, user);
  }

  public async applyPostTemplate(id: string, postId: string, user: ITokenUserPayload): Promise<void> {
    const template = await findOneOrFailTyped<TApplyPostTemplate>(id, this.postTemplateRepository, {
      select: ApplyPostTemplateQuery.select,
      where: { id, isActive: true },
      relations: ApplyPostTemplateQuery.relations,
    });

    const file = await this.fileManagementService.copyFile(template.file.id, user, EFileType.POST_PHOTOS);
    await this.postMediaContentService.createPostTemplateMediaContent(postId, file.id);
  }

  private buildPostTemplateEntity(dto: CreatePostTemplateDto): PostTemplate {
    return this.postTemplateRepository.create({
      file: { id: dto.id },
      isActive: true,
    });
  }
}

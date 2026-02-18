import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostTemplate } from 'src/modules/posts/entities';
import { Repository } from 'typeorm';
import { GetPostTemplatesQuery, TGetPostTemplates } from 'src/modules/posts/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { CreatePostTemplateDto } from 'src/modules/posts/common/dto';
import { EPostTemplateType } from 'src/modules/posts/common/enums';

@Injectable()
export class PostTemplateService {
  constructor(
    @InjectRepository(PostTemplate)
    private readonly postTemplateRepository: Repository<PostTemplate>,
  ) {}

  public async getPostTemplates(): Promise<TGetPostTemplates[]> {
    const postTemplates = await findManyTyped<TGetPostTemplates[]>(this.postTemplateRepository, {
      select: GetPostTemplatesQuery.select,
      where: { isActive: true, postType: EPostTemplateType.POST_TEMPLATE },
      relations: GetPostTemplatesQuery.relations,
    });

    return postTemplates;
  }

  public async createPostTemplate(dto: CreatePostTemplateDto): Promise<void> {
    const postTemplate = this.buildPostTemplateEntity(dto);
    await this.postTemplateRepository.save(postTemplate);
  }

  private buildPostTemplateEntity(dto: CreatePostTemplateDto): PostTemplate {
    return this.postTemplateRepository.create({
      file: { id: dto.id },
      isActive: true,
      postType: dto.postType,
      text: dto.text ? dto.text : null,
    });
  }
}

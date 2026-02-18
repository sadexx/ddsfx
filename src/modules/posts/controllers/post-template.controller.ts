import { Controller, UseGuards, Post, Body, Get } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { PostTemplateService } from 'src/modules/posts/services';
import { CreatePostTemplateDto } from 'src/modules/posts/common/dto';
import { TGetPostTemplates } from 'src/modules/posts/common/types';
import { RouteSchema } from '@nestjs/platform-fastify';

@Controller('posts/templates')
export class PostTemplateController {
  constructor(private readonly postTemplateService: PostTemplateService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get()
  findAll(): Promise<TGetPostTemplates[]> {
    return this.postTemplateService.getPostTemplates();
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreatePostTemplateDto.schema })
  async createPostTemplate(@Body() dto: CreatePostTemplateDto): Promise<void> {
    return this.postTemplateService.createPostTemplate(dto);
  }
}

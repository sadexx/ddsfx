import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { PostService } from 'src/modules/posts/services';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { CreatePostDto, UpdatePostDto } from 'src/modules/posts/common/dto';
import { PaginationCursorQueryDto, UUIDParamDto } from 'src/common/dto';
import { MessageOutput } from 'src/common/outputs';
import { GetAllPostsOutput } from 'src/modules/posts/common/outputs';
import { TGetPost } from 'src/modules/posts/common/types';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('/deceased/:id')
  @RouteSchema({ params: UUIDParamDto.schema, querystring: PaginationCursorQueryDto.schema })
  findAll(@Param() param: UUIDParamDto, @Query() dto: PaginationCursorQueryDto): Promise<GetAllPostsOutput> {
    return this.postService.findAll(param.id, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Get('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getById(@Param() param: UUIDParamDto): Promise<TGetPost> {
    return await this.postService.getById(param.id);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Post('/deceased/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreatePostDto.schema })
  async create(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
    @Body(ValidateAndTransformPipe) dto: CreatePostDto,
  ): Promise<MessageOutput> {
    return await this.postService.createPost(param.id, user, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdatePostDto.schema })
  async update(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
    @Body() dto: UpdatePostDto,
  ): Promise<MessageOutput> {
    return await this.postService.updatePost(param.id, user, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() param: UUIDParamDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    await this.postService.deletePost(param.id, user);
  }
}

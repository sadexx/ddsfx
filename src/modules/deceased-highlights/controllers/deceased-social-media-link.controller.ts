import { Controller, Param, UseGuards, Post, Body, Patch, Delete, Get, UsePipes } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeceasedSocialMediaLinkService } from 'src/modules/deceased-highlights/services';
import {
  CreateDeceasedSocialMediaLinkDto,
  UpdateDeceasedSocialMediaLinkDto,
} from 'src/modules/deceased-highlights/common/dto';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { TGetDeceasedSocialMediaLinks } from 'src/modules/deceased-highlights/common/types';

@Controller('deceased-highlights/social-media-links')
export class DeceasedSocialMediaLinkController {
  constructor(private readonly deceasedSocialMediaLinkService: DeceasedSocialMediaLinkService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getDeceasedSocialMediaLinks(@Param() param: UUIDParamDto): Promise<TGetDeceasedSocialMediaLinks[]> {
    return this.deceasedSocialMediaLinkService.getDeceasedSocialMediaLinks(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedSocialMediaLinkDto.schema })
  async createDeceasedSocialMediaLink(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: CreateDeceasedSocialMediaLinkDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedSocialMediaLinkService.createDeceasedSocialMediaLink(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateDeceasedSocialMediaLinkDto.schema })
  async updateDeceasedSocialMediaLink(
    @Param() param: UUIDParamDto,
    @Body() dto: UpdateDeceasedSocialMediaLinkDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedSocialMediaLinkService.updateDeceasedSocialMediaLink(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async removeDeceasedSocialMediaLink(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedSocialMediaLinkService.removeDeceasedSocialMediaLink(param, user);
  }
}

import { Controller, Param, UseGuards, Post, Body } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { DeceasedMediaContentService } from 'src/modules/deceased/services';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { CreateDeceasedMediaContentDto } from 'src/modules/deceased/common/dto';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Controller('deceased/media-content')
export class DeceasedMediaContentController {
  constructor(private readonly deceasedMediaContentService: DeceasedMediaContentService) {}

  @UseGuards(JwtFullAccessGuard)
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedMediaContentDto.schema })
  @Post(':id')
  async createDeceasedMediaContent(
    @Param() param: UUIDParamDto,
    @Body() dto: CreateDeceasedMediaContentDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedMediaContentService.createDeceasedMediaContent(param, dto, user);
  }
}

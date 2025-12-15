import { Controller, Param, UseGuards, Post, Body, Get } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeceasedBiographyService } from 'src/modules/deceased-highlights/services';
import { CreateDeceasedBiographyDto } from 'src/modules/deceased-highlights/common/dto';
import { TGetDeceasedBiographies } from 'src/modules/deceased-highlights/common/types';

@Controller('deceased-highlights/biographies')
export class DeceasedBiographyController {
  constructor(private readonly deceasedBiographyService: DeceasedBiographyService) {}

  @UseGuards(JwtFullAccessGuard)
  @RouteSchema({ params: UUIDParamDto.schema })
  @Get('/:id')
  async getDeceasedBiographies(@Param() param: UUIDParamDto): Promise<TGetDeceasedBiographies[]> {
    return this.deceasedBiographyService.getDeceasedBiographies(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedBiographyDto.schema })
  async createDeceasedBiography(
    @Param() param: UUIDParamDto,
    @Body() dto: CreateDeceasedBiographyDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedBiographyService.createDeceasedBiography(param, dto, user);
  }
}

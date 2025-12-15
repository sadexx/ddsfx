import { Controller, Param, UseGuards, Post, Body, Patch, Delete, Get, UsePipes } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeceasedResidenceService } from 'src/modules/deceased-highlights/services';
import { CreateDeceasedResidencesDto, UpdateDeceasedResidenceDto } from 'src/modules/deceased-highlights/common/dto';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { TGetDeceasedResidences } from 'src/modules/deceased-highlights/common/types';

@Controller('deceased-highlights/residences')
export class DeceasedResidenceController {
  constructor(private readonly deceasedResidenceService: DeceasedResidenceService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getDeceasedResidences(@Param() param: UUIDParamDto): Promise<TGetDeceasedResidences[]> {
    return this.deceasedResidenceService.getDeceasedResidences(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedResidencesDto.schema })
  async createDeceasedResidences(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: CreateDeceasedResidencesDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedResidenceService.createDeceasedResidences(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateDeceasedResidenceDto.schema })
  async updateDeceasedResidence(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: UpdateDeceasedResidenceDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedResidenceService.updateDeceasedResidence(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async removeDeceasedResidence(@Param() param: UUIDParamDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.deceasedResidenceService.removeDeceasedResidence(param, user);
  }
}

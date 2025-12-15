import { Controller, Param, UseGuards, Post, Body, Patch, Delete, Get, UsePipes } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeceasedEducationService } from 'src/modules/deceased-highlights/services';
import { CreateDeceasedEducationsDto, UpdateDeceasedEducationDto } from 'src/modules/deceased-highlights/common/dto';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { TGetDeceasedEducations } from 'src/modules/deceased-highlights/common/types';

@Controller('deceased-highlights/educations')
export class DeceasedEducationController {
  constructor(private readonly deceasedEducationService: DeceasedEducationService) {}

  @UseGuards(JwtFullAccessGuard)
  @RouteSchema({ params: UUIDParamDto.schema })
  @Get('/:id')
  async getDeceasedEducations(@Param() param: UUIDParamDto): Promise<TGetDeceasedEducations[]> {
    return this.deceasedEducationService.getDeceasedEducations(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedEducationsDto.schema })
  async createDeceasedEducations(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: CreateDeceasedEducationsDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedEducationService.createDeceasedEducations(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateDeceasedEducationDto.schema })
  async updateDeceasedEducation(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: UpdateDeceasedEducationDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedEducationService.updateDeceasedEducation(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async removeDeceasedEducation(@Param() param: UUIDParamDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.deceasedEducationService.removeDeceasedEducation(param, user);
  }
}

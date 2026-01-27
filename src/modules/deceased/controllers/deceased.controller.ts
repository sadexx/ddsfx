import { Body, Controller, Param, Post, UseGuards, Patch, Get, UsePipes } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { DeceasedService } from 'src/modules/deceased/services';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { CreateDeceasedProfileDto, UpdateDeceasedProfileDto } from 'src/modules/deceased/common/dto';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { CurrentUser } from 'src/common/decorators';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { TGetDeceasedProfile } from 'src/modules/deceased/common/types';
import { EntityIdOutput } from 'src/common/outputs';

@Controller('deceased')
export class DeceasedController {
  constructor(private readonly deceasedService: DeceasedService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('profile/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getDeceasedProfile(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<TGetDeceasedProfile | null> {
    return this.deceasedService.getDeceasedProfile(param, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('profile')
  @RouteSchema({ body: CreateDeceasedProfileDto.schema })
  async createDeceasedProfile(
    @Body(ValidateAndTransformPipe) dto: CreateDeceasedProfileDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<EntityIdOutput> {
    return this.deceasedService.createDeceasedProfile(dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('profile/:id')
  @RouteSchema({ body: UpdateDeceasedProfileDto.schema, params: UUIDParamDto.schema })
  async updateDeceasedProfile(
    @Param() param: UUIDParamDto,
    @Body() dto: UpdateDeceasedProfileDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedService.updateDeceasedProfile(param, dto, user);
  }
}

import {
  Controller,
  Param,
  UseGuards,
  Post,
  Body,
  Patch,
  Delete,
  Get,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { RouteSchema } from '@nestjs/platform-fastify';
import { UUIDParamDto } from 'src/common/dto';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeceasedHobbyService } from 'src/modules/deceased-highlights/services';
import { CreateDeceasedHobbyDto, UpdateDeceasedHobbyDto } from 'src/modules/deceased-highlights/common/dto';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { TGetDeceasedHobbies, TGetDeceasedHobbyTags } from 'src/modules/deceased-highlights/common/types';

@Controller('deceased-highlights/hobbies')
export class DeceasedHobbyController {
  constructor(private readonly deceasedHobbyService: DeceasedHobbyService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getDeceasedHobbies(@Param() param: UUIDParamDto): Promise<TGetDeceasedHobbies[]> {
    return this.deceasedHobbyService.getDeceasedHobbies(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Get('/tags')
  async getDeceasedHobbyTags(): Promise<TGetDeceasedHobbyTags[]> {
    return this.deceasedHobbyService.getDeceasedHobbyTags();
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedHobbyDto.schema })
  async createDeceasedHobby(
    @Param() param: UUIDParamDto,
    @Body() dto: CreateDeceasedHobbyDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedHobbyService.createDeceasedHobby(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateDeceasedHobbyDto.schema })
  async updateDeceasedHobby(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: UpdateDeceasedHobbyDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedHobbyService.updateDeceasedHobby(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDeceasedHobby(@Param() param: UUIDParamDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.deceasedHobbyService.removeDeceasedHobby(param, user);
  }
}

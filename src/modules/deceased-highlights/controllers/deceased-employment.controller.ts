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
import { DeceasedEmploymentService } from 'src/modules/deceased-highlights/services';
import { CreateDeceasedEmploymentsDto, UpdateDeceasedEmploymentDto } from 'src/modules/deceased-highlights/common/dto';
import { NotEmptyBodyPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { TGetDeceasedEmployments } from 'src/modules/deceased-highlights/common/types';

@Controller('deceased-highlights/employments')
export class DeceasedEmploymentController {
  constructor(private readonly deceasedEmploymentService: DeceasedEmploymentService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getDeceasedEmployments(@Param() param: UUIDParamDto): Promise<TGetDeceasedEmployments[]> {
    return this.deceasedEmploymentService.getDeceasedEmployments(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: CreateDeceasedEmploymentsDto.schema })
  async createDeceasedEmployments(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: CreateDeceasedEmploymentsDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedEmploymentService.createDeceasedEmployments(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateDeceasedEmploymentDto.schema })
  async updateDeceasedEmployment(
    @Param() param: UUIDParamDto,
    @Body(ValidateAndTransformPipe) dto: UpdateDeceasedEmploymentDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedEmploymentService.updateDeceasedEmployment(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDeceasedEmployment(@Param() param: UUIDParamDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.deceasedEmploymentService.removeDeceasedEmployment(param, user);
  }
}

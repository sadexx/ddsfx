import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeceasedCorrectionService } from 'src/modules/deceased-correction/services';
import { CreateDeceasedCorrectionDto } from 'src/modules/deceased-correction/common/dto';
import { IMessageOutput } from 'src/common/outputs';
import { DeceasedCorrection } from 'src/modules/deceased-correction/entities';

@Controller('deceased-corrections')
export class DeceasedCorrectionController {
  constructor(private readonly deceasedCorrectionService: DeceasedCorrectionService) {}

  // TODO: Remove this endpoint after admin panel is ready
  @UseGuards(JwtFullAccessGuard)
  @Get()
  async getAll(@CurrentUser() user: ITokenUserPayload): Promise<DeceasedCorrection[]> {
    return this.deceasedCorrectionService.getAll(user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateDeceasedCorrectionDto.schema })
  async create(
    @CurrentUser() user: ITokenUserPayload,
    @Body() dto: CreateDeceasedCorrectionDto,
  ): Promise<IMessageOutput> {
    return this.deceasedCorrectionService.createDeceasedCorrection(user, dto);
  }
}

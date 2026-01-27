import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CreateComplaintFormDto } from 'src/modules/complaint-form/common/dto';
import { ComplaintFormService } from 'src/modules/complaint-form/services';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { ComplaintForm } from 'src/modules/complaint-form/entities';
import { MessageOutput } from 'src/common/outputs';
import { RouteSchema } from '@nestjs/platform-fastify';
import { ValidateAndTransformPipe } from 'src/common/pipes';

@Controller('complaint-forms')
export class ComplaintFormController {
  constructor(private readonly complaintFormService: ComplaintFormService) {}

  // TODO: Remove this endpoint after admin panel is ready
  @UseGuards(JwtFullAccessGuard)
  @Get()
  async getAll(@CurrentUser() user: ITokenUserPayload): Promise<ComplaintForm[]> {
    return this.complaintFormService.getAll(user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateComplaintFormDto.schema })
  async createComplaintForm(
    @CurrentUser() user: ITokenUserPayload,
    @Body(ValidateAndTransformPipe) dto: CreateComplaintFormDto,
  ): Promise<MessageOutput> {
    return this.complaintFormService.createComplaintForm(user, dto);
  }
}

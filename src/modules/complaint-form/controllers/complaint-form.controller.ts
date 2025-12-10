import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CreateComplaintFormDto } from 'src/modules/complaint-form/common/dto';
import { ComplaintFormService } from 'src/modules/complaint-form/services';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { ComplaintForm } from 'src/modules/complaint-form/entities';
import { IMessageOutput } from 'src/common/outputs';
import { RouteSchema } from '@nestjs/platform-fastify';
import { ValidateAndTransformPipe } from 'src/common/pipes';

@Controller('complaint-forms')
export class ComplaintFormController {
  constructor(private readonly complaintFormService: ComplaintFormService) {}

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
  ): Promise<IMessageOutput> {
    return this.complaintFormService.createComplaintForm(user, dto);
  }
}

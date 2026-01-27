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
import { NotEmptyBodyPipe } from 'src/common/pipes';
import { ContactMethodService } from 'src/modules/informational-pages/services';
import { TGetContactMethods } from 'src/modules/informational-pages/common/types';
import { CreateContactMethodDto, UpdateContactMethodDto } from 'src/modules/informational-pages/common/dto';

@Controller('info-pages/contact-methods')
export class ContactMethodController {
  constructor(private readonly contactMethodService: ContactMethodService) {}

  @Get()
  async getContactMethods(): Promise<TGetContactMethods[]> {
    return this.contactMethodService.getContactMethods();
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateContactMethodDto.schema })
  async createContactMethod(@Body() dto: CreateContactMethodDto): Promise<void> {
    return this.contactMethodService.createContactMethod(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @UsePipes(NotEmptyBodyPipe)
  @Patch('/:id')
  @RouteSchema({ params: UUIDParamDto.schema, body: UpdateContactMethodDto.schema })
  async updateContactMethod(@Param() param: UUIDParamDto, @Body() dto: UpdateContactMethodDto): Promise<void> {
    return this.contactMethodService.updateContactMethod(param, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete('/:id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeContactMethod(@Param() param: UUIDParamDto): Promise<void> {
    return this.contactMethodService.removeContactMethod(param);
  }
}

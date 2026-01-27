import { Controller, Param, UseGuards, Query, Get, Post, Body, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { RouteSchema } from '@nestjs/platform-fastify';
import { PaginationQueryDto, UUIDParamDto } from 'src/common/dto';
import {
  TGetDeceasedSubscription,
  TGetDeceasedSubscriptions,
  TGetMyDeceasedSubscriptions,
} from 'src/modules/deceased/common/types';
import { PaginationOutput } from 'src/common/outputs';
import { CurrentUser } from 'src/common/decorators';
import { CreateDeceasedSubscriptionDto } from 'src/modules/deceased/common/dto';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Controller('deceased-subscriptions')
export class DeceasedSubscriptionsController {
  constructor(private readonly deceasedSubscriptions: DeceasedSubscriptionService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get()
  async getMyDeceasedSubscriptions(@CurrentUser() user: ITokenUserPayload): Promise<TGetMyDeceasedSubscriptions[]> {
    return this.deceasedSubscriptions.getMyDeceasedSubscriptions(user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Get('/deceased/:id')
  @RouteSchema({ querystring: PaginationQueryDto.schema, params: UUIDParamDto.schema })
  async getDeceasedSubscriptions(
    @Param() param: UUIDParamDto,
    @Query() dto: PaginationQueryDto,
  ): Promise<PaginationOutput<TGetDeceasedSubscriptions>> {
    return this.deceasedSubscriptions.getDeceasedSubscriptions(param, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Get(':id')
  @RouteSchema({ params: UUIDParamDto.schema })
  async getDeceasedSubscription(@Param() param: UUIDParamDto): Promise<TGetDeceasedSubscription> {
    return this.deceasedSubscriptions.getDeceasedSubscription(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @RouteSchema({ body: CreateDeceasedSubscriptionDto.schema, params: UUIDParamDto.schema })
  @Post(':id')
  async subscribeDeceasedProfile(
    @Param() param: UUIDParamDto,
    @Body() dto: CreateDeceasedSubscriptionDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedSubscriptions.subscribeDeceasedProfile(param, dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Delete(':id')
  @RouteSchema({ params: UUIDParamDto.schema })
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribeDeceasedProfile(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedSubscriptions.unsubscribeDeceasedProfile(param, user);
  }
}

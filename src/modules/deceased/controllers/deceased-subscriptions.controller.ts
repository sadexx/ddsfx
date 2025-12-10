import { Controller, Param, UseGuards, Query, Get, Post, Body, Delete } from '@nestjs/common';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { DeceasedSubscriptionService } from 'src/modules/deceased/services';
import { RouteSchema } from '@nestjs/platform-fastify';
import { PaginationQueryDto, UUIDParamDto } from 'src/common/dto';
import { TGetDeceasedSubscription, TGetDeceasedSubscriptions } from 'src/modules/deceased/common/types';
import { PaginationOutput } from 'src/common/outputs';
import { CurrentUser } from 'src/common/decorators';
import { CreateDeceasedSubscriptionDto } from 'src/modules/deceased/common/dto';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Controller('deceased-subscriptions')
export class DeceasedSubscriptionsController {
  constructor(private readonly deceasedSubscriptions: DeceasedSubscriptionService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('/deceased/:id')
  @RouteSchema({ querystring: PaginationQueryDto.schema })
  async getDeceasedSubscriptions(
    @Param() param: UUIDParamDto,
    @Query() dto: PaginationQueryDto,
  ): Promise<PaginationOutput<TGetDeceasedSubscriptions>> {
    return this.deceasedSubscriptions.getDeceasedSubscriptions(param, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Get(':id')
  async getDeceasedSubscription(@Param() param: UUIDParamDto): Promise<TGetDeceasedSubscription> {
    return this.deceasedSubscriptions.getDeceasedSubscription(param);
  }

  @UseGuards(JwtFullAccessGuard)
  @RouteSchema({ body: CreateDeceasedSubscriptionDto.schema })
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
  async unsubscribeDeceasedProfile(
    @Param() param: UUIDParamDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<void> {
    return this.deceasedSubscriptions.unsubscribeDeceasedProfile(param, user);
  }
}

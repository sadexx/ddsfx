import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserProfileService } from 'src/modules/users/services';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { CreateUserProfileDto, UpdateUserProfileDto } from 'src/modules/users/common/dto';
import { RouteSchema } from '@nestjs/platform-fastify';
import { TGetUserProfile } from 'src/modules/users/common/types';

@Controller('users/profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get()
  async getUserProfile(@CurrentUser() user: ITokenUserPayload): Promise<TGetUserProfile> {
    return this.userProfileService.getUserProfile(user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: CreateUserProfileDto.schema })
  async createUserProfile(@Body() dto: CreateUserProfileDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.userProfileService.createUserProfile(dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Patch()
  @RouteSchema({ body: UpdateUserProfileDto.schema })
  async updateUserProfile(@Body() dto: UpdateUserProfileDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.userProfileService.updateUserProfile(dto, user);
  }
}

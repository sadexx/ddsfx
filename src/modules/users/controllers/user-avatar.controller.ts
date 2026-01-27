import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserAvatarService } from 'src/modules/users/services';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { SetUserAvatarDto } from 'src/modules/users/common/dto';
import { RouteSchema } from '@nestjs/platform-fastify';

@Controller('users/avatar')
export class UserAvatarController {
  constructor(private readonly userAvatarService: UserAvatarService) {}

  @UseGuards(JwtFullAccessGuard)
  @Post()
  @RouteSchema({ body: SetUserAvatarDto.schema })
  async setUserAvatar(@Body() dto: SetUserAvatarDto, @CurrentUser() user: ITokenUserPayload): Promise<void> {
    return this.userAvatarService.setUserAvatar(dto, user);
  }
}

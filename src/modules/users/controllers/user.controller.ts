import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from 'src/modules/users/services';
import { User } from 'src/modules/users/entities';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtFullAccessGuard)
  @Get('profile')
  async getUserProfile(@CurrentUser() user: ITokenUserPayload): Promise<User> {
    return this.userService.getUserProfile(user);
  }
}

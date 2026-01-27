import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserContactInfoService } from 'src/modules/users/services';
import { JwtFullAccessGuard } from 'src/libs/guards/common/guards';
import { CurrentUser } from 'src/common/decorators';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { ChangeEmailDto, ChangePhoneNumberDto } from 'src/modules/users/common/dto';
import { RouteSchema } from '@nestjs/platform-fastify';
import { MessageOutput } from 'src/common/outputs';

@Controller('users/contact-info')
export class UserContactInfoController {
  constructor(private readonly userContactInfoService: UserContactInfoService) {}

  @UseGuards(JwtFullAccessGuard)
  @Post('change-phone-number')
  @RouteSchema({ body: ChangePhoneNumberDto.schema })
  async changePhoneNumber(
    @Body() dto: ChangePhoneNumberDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<MessageOutput> {
    return this.userContactInfoService.changePhoneNumber(dto, user);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('change-email')
  @RouteSchema({ body: ChangeEmailDto.schema })
  async changeEmail(@Body() dto: ChangeEmailDto, @CurrentUser() user: ITokenUserPayload): Promise<MessageOutput> {
    return this.userContactInfoService.changeEmail(dto, user);
  }
}

import { Body, Controller, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientInfo, CurrentUser, OpaqueToken } from 'src/common/decorators';
import { JwtFullAccessGuard, OpqOtpVerificationGuard } from 'src/libs/guards/common/guards';
import { UserPasswordService } from 'src/modules/users/services';
import { ResetPasswordDto, SetPasswordDto, UpdatePasswordDto } from 'src/modules/users/common/dto';
import { IOpaqueTokenData, ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { ClientInfoValidationPipe, ValidateAndTransformPipe } from 'src/common/pipes';
import { MessageOutput } from 'src/common/outputs';
import { RouteSchema } from '@nestjs/platform-fastify';
import { IClientInfo } from 'src/common/interfaces';
import { ClearCookiesInterceptor } from 'src/modules/auth/common/interceptors';
import { ETokenName } from 'src/libs/tokens/common/enums';

@Controller('users/password')
export class UserPasswordController {
  constructor(private readonly userPasswordService: UserPasswordService) {}

  @Post('reset')
  @RouteSchema({ body: ResetPasswordDto.schema })
  async resetPassword(
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: ResetPasswordDto,
  ): Promise<MessageOutput> {
    return this.userPasswordService.resetPassword(clientInfo, dto);
  }

  @UseGuards(OpqOtpVerificationGuard)
  @Patch('set')
  @UseInterceptors(ClearCookiesInterceptor([ETokenName.OTP_VERIFICATION_TOKEN]))
  @RouteSchema({ body: SetPasswordDto.schema })
  async setPassword(@OpaqueToken() tokenDto: IOpaqueTokenData, @Body() dto: SetPasswordDto): Promise<MessageOutput> {
    return this.userPasswordService.setPassword(tokenDto, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Patch('update')
  @RouteSchema({ body: UpdatePasswordDto.schema })
  async updatePassword(
    @Body(ValidateAndTransformPipe) dto: UpdatePasswordDto,
    @CurrentUser() user: ITokenUserPayload,
  ): Promise<MessageOutput> {
    return this.userPasswordService.updatePassword(dto, user);
  }
}

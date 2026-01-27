import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientInfo, CurrentUser, OpaqueToken } from 'src/common/decorators';
import { IClientInfo } from 'src/common/interfaces';
import { ClientInfoValidationPipe } from 'src/common/pipes';
import { AuthService } from 'src/modules/auth/services';
import { RefreshTokensDto, LoginEmailDto, LoginPhoneNumberDto } from 'src/modules/auth/common/dto';
import { IOpaqueTokenData, ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { OneRoleLoginOutput } from 'src/modules/auth/common/outputs';
import { JwtFullAccessGuard, OpaqueRefreshGuard, OpqOtpVerificationGuard } from 'src/libs/guards/common/guards';
import { ClearCookiesInterceptor, SetCookiesInterceptor } from 'src/modules/auth/common/interceptors';
import { ETokenName } from 'src/libs/tokens/common/enums';
import { RouteSchema } from '@nestjs/platform-fastify';
import { MessageOutput } from 'src/common/outputs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/email')
  @RouteSchema({ body: LoginEmailDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async loginEmail(
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: LoginEmailDto,
  ): Promise<OneRoleLoginOutput> {
    return await this.authService.loginEmail(clientInfo, dto);
  }

  @Post('login/phone-number')
  @RouteSchema({ body: LoginPhoneNumberDto.schema })
  async loginPhoneNumber(
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: LoginPhoneNumberDto,
  ): Promise<MessageOutput> {
    return await this.authService.loginPhoneNumber(clientInfo, dto);
  }

  @UseGuards(OpqOtpVerificationGuard)
  @Post('login/phone-number/complete')
  @UseInterceptors(ClearCookiesInterceptor([ETokenName.OTP_VERIFICATION_TOKEN]), SetCookiesInterceptor)
  async completeLoginPhoneNumber(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
  ): Promise<OneRoleLoginOutput> {
    return await this.authService.verifyPhoneNumberCredentials(tokenDto, clientInfo);
  }

  @UseGuards(OpaqueRefreshGuard)
  @Post('refresh-tokens')
  @RouteSchema({ body: RefreshTokensDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async refreshTokens(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: RefreshTokensDto,
  ): Promise<OneRoleLoginOutput> {
    return await this.authService.refreshTokens(tokenDto, clientInfo, dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('logout')
  @UseInterceptors(ClearCookiesInterceptor([ETokenName.ACCESS_TOKEN, ETokenName.REFRESH_TOKEN]), SetCookiesInterceptor)
  async logout(@CurrentUser() user: ITokenUserPayload): Promise<OneRoleLoginOutput> {
    const logoutResult = await this.authService.logout(user);

    return logoutResult;
  }
}

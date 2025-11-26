import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppleMobileTokenGuard, GoogleMobileTokenGuard } from 'src/libs/guards/common/guards';
import { AuthThirdPartyService } from 'src/modules/auth/services';
import { AppleTokenData, GoogleTokenData } from 'src/modules/auth/common/decorators';
import { IAppleProviderOutput, IGoogleProviderOutput } from 'src/libs/tokens/common/interfaces';
import { LoginThirdPartyMobileDto } from 'src/modules/auth/common/dto';
import { ClientInfo } from 'src/common/decorators';
import { ClientInfoValidationPipe } from 'src/common/pipes';
import { IClientInfo } from 'src/common/interfaces';
import { IStartRegistrationOutput, OneRoleLoginOutput } from 'src/modules/auth/common/outputs';
import { SetCookiesInterceptor } from 'src/modules/auth/common/interceptors';
import { RouteSchema } from '@nestjs/platform-fastify';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';

@Controller('auth')
export class AuthThirdPartyController {
  constructor(private readonly authThirdPartyService: AuthThirdPartyService) {}

  @UseGuards(GoogleMobileTokenGuard)
  @Post('google-mobile')
  @RouteSchema({ body: LoginThirdPartyMobileDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async googleMobile(
    @GoogleTokenData() googleToken: IGoogleProviderOutput,
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: LoginThirdPartyMobileDto,
  ): Promise<OneRoleLoginOutput | IStartRegistrationOutput> {
    return await this.authThirdPartyService.handleThirdPartyAuth(
      ERegistrationStrategy.GOOGLE,
      googleToken,
      clientInfo,
      dto,
    );
  }

  @UseGuards(AppleMobileTokenGuard)
  @Post('apple-mobile')
  @RouteSchema({ body: LoginThirdPartyMobileDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async appleMobileLogin(
    @AppleTokenData() appleToken: IAppleProviderOutput,
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: LoginThirdPartyMobileDto,
  ): Promise<OneRoleLoginOutput | IStartRegistrationOutput> {
    return await this.authThirdPartyService.handleThirdPartyAuth(
      ERegistrationStrategy.APPLE,
      appleToken,
      clientInfo,
      dto,
    );
  }
}

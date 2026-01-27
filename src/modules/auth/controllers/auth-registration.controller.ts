import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientInfo, OpaqueToken } from 'src/common/decorators';
import { OpqRegistrationGuard } from 'src/libs/guards/common/guards';
import { IClientInfo } from 'src/common/interfaces';
import { ClientInfoValidationPipe } from 'src/common/pipes';
import { AuthRegistrationService } from 'src/modules/auth/services';
import { ClearCookiesInterceptor, SetCookiesInterceptor } from 'src/modules/auth/common/interceptors';
import { AddEmailDto, AddPasswordDto, AddPhoneNumberDto, StartRegistrationDto } from 'src/modules/auth/common/dto';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import {
  IRegistrationStepsOutput,
  IStartRegistrationOutput,
  OneRoleLoginOutput,
} from 'src/modules/auth/common/outputs';
import { ETokenName } from 'src/libs/tokens/common/enums';
import { RouteSchema } from '@nestjs/platform-fastify';
import { MessageOutput } from 'src/common/outputs';

@Controller('registration')
export class AuthRegistrationController {
  constructor(private readonly authRegistrationService: AuthRegistrationService) {}

  @Post('start-registration')
  @RouteSchema({ body: StartRegistrationDto.schema })
  @UseInterceptors(ClearCookiesInterceptor([ETokenName.ACCESS_TOKEN, ETokenName.REFRESH_TOKEN]), SetCookiesInterceptor)
  async startRegistration(
    @ClientInfo(ClientInfoValidationPipe) clientInfo: IClientInfo,
    @Body() dto: StartRegistrationDto,
  ): Promise<IStartRegistrationOutput> {
    return await this.authRegistrationService.startRegistration(clientInfo, dto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Get('steps')
  async getRegistrationSteps(@OpaqueToken() tokenDto: IOpaqueTokenData): Promise<IRegistrationStepsOutput> {
    return this.authRegistrationService.getRegistrationSteps(tokenDto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Post('add-email')
  @RouteSchema({ body: AddEmailDto.schema })
  async addEmail(@OpaqueToken() tokenDto: IOpaqueTokenData, @Body() dto: AddEmailDto): Promise<MessageOutput> {
    return await this.authRegistrationService.addEmail(tokenDto, dto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Post('add-password')
  @RouteSchema({ body: AddPasswordDto.schema })
  async addPassword(@OpaqueToken() tokenDto: IOpaqueTokenData, @Body() dto: AddPasswordDto): Promise<MessageOutput> {
    return await this.authRegistrationService.addPassword(tokenDto, dto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Post('add-phone-number')
  @RouteSchema({ body: AddPhoneNumberDto.schema })
  async addPhoneNumber(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @Body() dto: AddPhoneNumberDto,
  ): Promise<MessageOutput> {
    return await this.authRegistrationService.addPhoneNumber(tokenDto, dto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Post('finish-registration')
  @UseInterceptors(ClearCookiesInterceptor([ETokenName.REGISTRATION_TOKEN]), SetCookiesInterceptor)
  async finishRegistration(@OpaqueToken() tokenDto: IOpaqueTokenData): Promise<OneRoleLoginOutput> {
    return await this.authRegistrationService.finishRegistration(tokenDto);
  }
}

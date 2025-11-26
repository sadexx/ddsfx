import { BadRequestException, Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { OpaqueToken } from 'src/common/decorators';
import { OpqRegistrationGuard } from 'src/libs/guards/common/guards';
import { OtpVerificationService } from 'src/modules/otp/services';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { VerifyEmailDto, VerifyPhoneNumberDto } from 'src/modules/otp/common/dto';
import { SetCookiesInterceptor } from 'src/modules/auth/common/interceptors';
import { IOtpVerificationOutput } from 'src/libs/temporal-state/common/outputs';
import { RouteSchema } from '@nestjs/platform-fastify';
import { IMessageOutput } from 'src/common/outputs';

@Controller('otp')
export class OtpVerificationController {
  constructor(private readonly otpVerificationService: OtpVerificationService) {}

  @UseGuards(OpqRegistrationGuard)
  @Post('registration/verify-email')
  @RouteSchema({ body: VerifyEmailDto.schema })
  async verifyRegistrationEmail(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @Body() dto: VerifyEmailDto,
  ): Promise<IMessageOutput> {
    throw new BadRequestException('Verifying email is currently disabled.');

    return await this.otpVerificationService.verifyRegistrationEmail(tokenDto, dto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Post('registration/verify-phone-number')
  @RouteSchema({ body: VerifyPhoneNumberDto.schema })
  async verifyRegistrationPhoneNumber(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @Body() dto: VerifyPhoneNumberDto,
  ): Promise<IMessageOutput> {
    return await this.otpVerificationService.verifyRegistrationPhoneNumber(tokenDto, dto);
  }

  @Post('verification/login')
  @RouteSchema({ body: VerifyPhoneNumberDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async verifyLogin(@Body() dto: VerifyPhoneNumberDto): Promise<IOtpVerificationOutput> {
    return await this.otpVerificationService.verifyLoginOtp(dto);
  }
}

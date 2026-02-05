import { Body, Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { OpaqueToken } from 'src/common/decorators';
import { JwtFullAccessGuard, OpqRegistrationGuard } from 'src/libs/guards/common/guards';
import { OtpVerificationService } from 'src/modules/otp/services';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { VerifyEmailDto, VerifyPasswordResetDto, VerifyPhoneNumberDto } from 'src/modules/otp/common/dto';
import { SetCookiesInterceptor } from 'src/modules/auth/common/interceptors';
import { IOtpVerificationOutput } from 'src/libs/temporal-state/common/outputs';
import { RouteSchema } from '@nestjs/platform-fastify';
import { MessageOutput } from 'src/common/outputs';

@Controller('otp')
export class OtpVerificationController {
  constructor(private readonly otpVerificationService: OtpVerificationService) {}

  @UseGuards(OpqRegistrationGuard)
  @Post('registration/verify-email')
  @RouteSchema({ body: VerifyEmailDto.schema })
  async verifyRegistrationEmail(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @Body() dto: VerifyEmailDto,
  ): Promise<MessageOutput> {
    return await this.otpVerificationService.verifyRegistrationEmail(tokenDto, dto);
  }

  @UseGuards(OpqRegistrationGuard)
  @Post('registration/verify-phone-number')
  @RouteSchema({ body: VerifyPhoneNumberDto.schema })
  async verifyRegistrationPhoneNumber(
    @OpaqueToken() tokenDto: IOpaqueTokenData,
    @Body() dto: VerifyPhoneNumberDto,
  ): Promise<MessageOutput> {
    return await this.otpVerificationService.verifyRegistrationPhoneNumber(tokenDto, dto);
  }

  @Post('verification/login')
  @RouteSchema({ body: VerifyPhoneNumberDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async verifyLogin(@Body() dto: VerifyPhoneNumberDto): Promise<IOtpVerificationOutput> {
    return await this.otpVerificationService.verifyLoginOtp(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('verification/change-phone-number')
  @RouteSchema({ body: VerifyPhoneNumberDto.schema })
  async verifyChangePhoneNumberOtp(@Body() dto: VerifyPhoneNumberDto): Promise<void> {
    return await this.otpVerificationService.verifyChangePhoneNumberOtp(dto);
  }

  @UseGuards(JwtFullAccessGuard)
  @Post('verification/change-email')
  @RouteSchema({ body: VerifyEmailDto.schema })
  async verifyChangeEmailOtp(@Body() dto: VerifyEmailDto): Promise<void> {
    return await this.otpVerificationService.verifyChangeEmailOtp(dto);
  }

  @Post('verification/password-reset')
  @RouteSchema({ body: VerifyPasswordResetDto.schema })
  @UseInterceptors(SetCookiesInterceptor)
  async verifyPasswordResetOtp(@Body() dto: VerifyPasswordResetDto): Promise<IOtpVerificationOutput> {
    return await this.otpVerificationService.verifyPasswordResetOtp(dto);
  }
}

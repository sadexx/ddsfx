import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpService } from 'src/modules/otp/services';
import { OtpLoginRepository, RegistrationRepository } from 'src/libs/temporal-state/repositories';
import { VerifyEmailDto, VerifyPhoneNumberDto } from 'src/modules/otp/common/dto';
import { EOtpFlowType } from 'src/modules/otp/common/enum';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { IOtpVerificationOutput } from 'src/libs/temporal-state/common/outputs';
import { IMessageOutput } from 'src/common/outputs';

@Injectable()
export class OtpVerificationService {
  constructor(
    private readonly otpService: OtpService,
    private readonly registrationRepository: RegistrationRepository,
    private readonly otpLoginRepository: OtpLoginRepository,
  ) {}

  public async sendRegistrationEmailOtp(email: string): Promise<void> {
    await this.otpService.sendOtpCode(EOtpFlowType.ADD_EMAIL, email);
  }

  public async verifyRegistrationEmail(tokenDto: IOpaqueTokenData, dto: VerifyEmailDto): Promise<IMessageOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.ADD_EMAIL, dto.email, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.registrationRepository.markEmailVerified(tokenDto.token);

    return { message: 'Email verified successfully' };
  }

  public async sendRegistrationPhoneNumberOtp(phoneNumber: string): Promise<void> {
    await this.otpService.sendOtpCode(EOtpFlowType.ADD_PHONE_NUMBER, phoneNumber);
  }

  public async verifyRegistrationPhoneNumber(
    tokenDto: IOpaqueTokenData,
    dto: VerifyPhoneNumberDto,
  ): Promise<IMessageOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.ADD_PHONE_NUMBER, dto.phoneNumber, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.registrationRepository.markPhoneNumberVerified(tokenDto.token);

    return { message: 'Phone number verified successfully' };
  }

  public async sendLoginOtp(phoneNumber: string): Promise<void> {
    await this.otpService.sendOtpCode(EOtpFlowType.LOGIN, phoneNumber);
  }

  public async verifyLoginOtp(dto: VerifyPhoneNumberDto): Promise<IOtpVerificationOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.LOGIN, dto.phoneNumber, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    return this.otpLoginRepository.verifyAndGenerateToken(dto.phoneNumber);
  }

  public async sendChangeEmailOtp(email: string): Promise<void> {
    await this.otpService.sendOtpCode(EOtpFlowType.CHANGE_EMAIL, email);
  }
}

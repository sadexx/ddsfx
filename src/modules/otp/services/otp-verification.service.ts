import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpService } from 'src/modules/otp/services';
import {
  OtpLoginRepository,
  PasswordResetRepository,
  RegistrationRepository,
  UserContactInfoRepository,
} from 'src/libs/temporal-state/repositories';
import { VerifyEmailDto, VerifyPasswordResetDto, VerifyPhoneNumberDto } from 'src/modules/otp/common/dto';
import { EOtpFlowType } from 'src/modules/otp/common/enum';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { IOtpVerificationOutput } from 'src/libs/temporal-state/common/outputs';
import { MessageOutput } from 'src/common/outputs';
import { MockOtpService } from 'src/modules/mock/services';

@Injectable()
export class OtpVerificationService {
  constructor(
    private readonly otpService: OtpService,
    private readonly registrationRepository: RegistrationRepository,
    private readonly otpLoginRepository: OtpLoginRepository,
    private readonly mockOtpService: MockOtpService,
    private readonly userContactInfoRepository: UserContactInfoRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  public async sendRegistrationEmailOtp(email: string): Promise<void> {
    await this.sendOtpCode(EOtpFlowType.ADD_EMAIL, email);
  }

  public async verifyRegistrationEmail(tokenDto: IOpaqueTokenData, dto: VerifyEmailDto): Promise<MessageOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.ADD_EMAIL, dto.email, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.registrationRepository.markEmailVerified(tokenDto.token);

    return { message: 'Email verified successfully' };
  }

  public async sendRegistrationPhoneNumberOtp(phoneNumber: string): Promise<void> {
    await this.sendOtpCode(EOtpFlowType.ADD_PHONE_NUMBER, phoneNumber);
  }

  public async verifyRegistrationPhoneNumber(
    tokenDto: IOpaqueTokenData,
    dto: VerifyPhoneNumberDto,
  ): Promise<MessageOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.ADD_PHONE_NUMBER, dto.phoneNumber, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.registrationRepository.markPhoneNumberVerified(tokenDto.token);

    return { message: 'Phone number verified successfully' };
  }

  public async sendLoginOtp(phoneNumber: string): Promise<void> {
    await this.sendOtpCode(EOtpFlowType.LOGIN, phoneNumber);
  }

  public async verifyLoginOtp(dto: VerifyPhoneNumberDto): Promise<IOtpVerificationOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.LOGIN, dto.phoneNumber, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    return this.otpLoginRepository.verifyAndGenerateToken(dto.phoneNumber);
  }

  public async sendChangeEmailOtp(email: string): Promise<void> {
    await this.sendOtpCode(EOtpFlowType.CHANGE_EMAIL, email);
  }

  public async verifyChangeEmailOtp(dto: VerifyEmailDto): Promise<void> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.CHANGE_EMAIL, dto.email, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.userContactInfoRepository.changeEmail(dto.email);
  }

  public async sendChangePhoneNumberOtp(phoneNumber: string): Promise<void> {
    await this.sendOtpCode(EOtpFlowType.CHANGE_PHONE_NUMBER, phoneNumber);
  }

  public async verifyChangePhoneNumberOtp(dto: VerifyPhoneNumberDto): Promise<void> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.CHANGE_PHONE_NUMBER, dto.phoneNumber, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.userContactInfoRepository.changePhoneNumber(dto.phoneNumber);
  }

  public async sendResetPasswordOtp(email: string): Promise<void> {
    await this.sendOtpCode(EOtpFlowType.RESET_PASSWORD, email);
  }

  public async verifyPasswordResetOtp(dto: VerifyPasswordResetDto): Promise<IOtpVerificationOutput> {
    const isValid = await this.otpService.verifyOtpCode(EOtpFlowType.RESET_PASSWORD, dto.email, dto.code);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    return await this.passwordResetRepository.createState(dto.email);
  }

  private async sendOtpCode(flowType: EOtpFlowType, identifier: string): Promise<void> {
    if (await this.mockOtpService.isMockedIdentifier(identifier)) {
      const mockOtpCode = this.mockOtpService.getMockOtpCode();
      await this.otpService.createOtpWithoutSending(flowType, identifier, mockOtpCode);
    } else {
      await this.otpService.sendOtpCode(flowType, identifier);
    }
  }
}

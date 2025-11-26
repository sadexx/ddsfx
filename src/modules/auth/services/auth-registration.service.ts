import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthStepService } from 'src/modules/auth/services/auth-step.service';
import { TokenService } from 'src/libs/tokens/services';
import { RegistrationRepository } from 'src/libs/temporal-state/repositories';
import { SessionService } from 'src/modules/sessions/services';
import { OtpVerificationService } from 'src/modules/otp/services';
import { IClientInfo } from 'src/common/interfaces';
import {
  AddEmailDto,
  AddPasswordDto,
  AddPhoneNumberDto,
  LoginThirdPartyMobileDto,
  StartRegistrationDto,
} from 'src/modules/auth/common/dto';
import {
  IRegistrationStepsOutput,
  IStartRegistrationOutput,
  OneRoleLoginOutput,
} from 'src/modules/auth/common/outputs';
import { IAppleProviderOutput, IGoogleProviderOutput, IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { IMessageOutput } from 'src/common/outputs';
import { AuthCreateAccountService } from 'src/modules/auth/services/auth-create-account.service';
import { IRegistrationState, IStartRegistration } from 'src/libs/temporal-state/common/interfaces';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';

@Injectable()
export class AuthRegistrationService {
  constructor(
    private readonly authStepService: AuthStepService,
    private readonly tokenService: TokenService,
    private readonly registrationRepository: RegistrationRepository,
    private readonly sessionService: SessionService,
    private readonly otpVerificationService: OtpVerificationService,
    private readonly authCreateAccountService: AuthCreateAccountService,
  ) {}

  public async getRegistrationSteps(tokenDto: IOpaqueTokenData): Promise<IRegistrationStepsOutput> {
    const registrationData = await this.registrationRepository.getRegistration(tokenDto.token);

    const originalSteps = this.authStepService.determineStepsStrategy(registrationData.authProvider);
    const steps = this.authStepService.checkUserStepsCompletion(originalSteps, registrationData);

    return { registrationSteps: steps };
  }

  public async startOathRegistration(
    registrationStrategy: ERegistrationStrategy,
    token: IAppleProviderOutput | IGoogleProviderOutput,
    clientInfo: IClientInfo,
    dto: LoginThirdPartyMobileDto,
  ): Promise<IStartRegistrationOutput> {
    await this.registrationRepository.checkRegistrationAttemptLimit(clientInfo.ipAddress);

    const registrationToken = await this.tokenService.generateRegistrationToken();
    const registrationData = this.buildStartRegistrationData(
      registrationToken,
      registrationStrategy,
      clientInfo,
      dto,
      token,
    );
    await this.registrationRepository.createRegistrationState(registrationData);

    const steps = this.authStepService.determineStepsStrategy(registrationStrategy);

    return { registrationToken: registrationToken, registrationSteps: steps };
  }

  public async startRegistration(
    clientInfo: IClientInfo,
    dto: StartRegistrationDto,
  ): Promise<IStartRegistrationOutput> {
    await this.registrationRepository.checkRegistrationAttemptLimit(clientInfo.ipAddress);

    const registrationToken = await this.tokenService.generateRegistrationToken();

    const registrationData = this.buildStartRegistrationData(
      registrationToken,
      dto.registrationStrategy,
      clientInfo,
      dto,
    );
    await this.registrationRepository.createRegistrationState(registrationData);

    const steps = this.authStepService.determineStepsStrategy(dto.registrationStrategy);

    return { registrationToken: registrationToken, registrationSteps: steps };
  }

  public async addEmail(tokenDto: IOpaqueTokenData, dto: AddEmailDto): Promise<IMessageOutput> {
    await this.authCreateAccountService.checkEmailUniqueness(dto.email);
    await this.registrationRepository.recordEmailVerificationAttempt(tokenDto.token, dto.email);
    await this.otpVerificationService.sendRegistrationEmailOtp(dto.email);

    return { message: 'Verification OTP has been sent to the provided email address.' };
  }

  public async addPassword(tokenDto: IOpaqueTokenData, dto: AddPasswordDto): Promise<IMessageOutput> {
    await this.registrationRepository.setPassword(tokenDto.token, dto.password);

    return { message: 'Password has been set successfully.' };
  }

  public async addPhoneNumber(tokenDto: IOpaqueTokenData, dto: AddPhoneNumberDto): Promise<IMessageOutput> {
    await this.authCreateAccountService.checkPhoneNumberUniqueness(dto.phoneNumber);
    await this.registrationRepository.recordPhoneVerificationAttempt(tokenDto.token, dto.phoneNumber);
    await this.otpVerificationService.sendRegistrationPhoneNumberOtp(dto.phoneNumber);

    return { message: 'Verification OTP has been sent to the provided phone number.' };
  }

  public async finishRegistration(tokenDto: IOpaqueTokenData): Promise<OneRoleLoginOutput> {
    const registrationData = await this.registrationRepository.getRegistration(tokenDto.token);
    const originalSteps = this.authStepService.determineStepsStrategy(registrationData.authProvider);
    const steps = this.authStepService.checkUserStepsCompletion(originalSteps, registrationData);

    if (steps.some((step) => !step.isCompleted && step.name !== 'finish')) {
      const formatIncompleteSteps = steps
        .filter((step) => !step.isCompleted && step.name !== 'finish')
        .map((step) => `${step.index}: ${step.name}`)
        .join(', ');

      throw new BadRequestException(`Registration steps are not completed: ${formatIncompleteSteps}`);
    }

    const loginOutput = await this.registerAccount(registrationData);

    await this.registrationRepository.deleteRegistration(tokenDto.token);

    return loginOutput;
  }

  public async registerAccount(dto: IRegistrationState): Promise<OneRoleLoginOutput> {
    const newUser = await this.authCreateAccountService.createAccount(dto);

    return await this.sessionService.startAccessSession(dto.authProvider, newUser, dto.roleName, dto.clientInfo, dto);
  }

  private buildStartRegistrationData(
    registrationToken: string,
    registrationStrategy: ERegistrationStrategy,
    clientInfo: IClientInfo,
    dto: StartRegistrationDto | LoginThirdPartyMobileDto,
    token?: IAppleProviderOutput | IGoogleProviderOutput,
  ): IStartRegistration {
    return {
      registrationToken: registrationToken,
      registrationStrategy: registrationStrategy,
      roleName: EUserRoleName.USER,
      email: token?.email,
      isVerifiedEmail: token?.isVerifiedEmail,
      clientInfo: clientInfo,
      networkMetadata: dto.networkMetadata,
      deviceInfo: dto.deviceInfo,
    };
  }
}

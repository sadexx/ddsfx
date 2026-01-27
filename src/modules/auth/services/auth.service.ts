import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities';
import { OtpLoginRepository } from 'src/libs/temporal-state/repositories';
import { BcryptHashingService } from 'src/libs/hashing/services';
import { SessionService } from 'src/modules/sessions/services';
import { OtpVerificationService } from 'src/modules/otp/services';
import { IClientInfo } from 'src/common/interfaces';
import {
  DeviceInfoDto,
  NetworkMetadataDto,
  RefreshTokensDto,
  LoginEmailDto,
  LoginPhoneNumberDto,
} from 'src/modules/auth/common/dto';
import { EAuthProvider } from 'src/modules/auth/common/enums';
import { OneRoleLoginOutput } from 'src/modules/auth/common/outputs';
import { IOpaqueTokenData, ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { MessageOutput } from 'src/common/outputs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly otpLoginRepository: OtpLoginRepository,
    private readonly bcryptHashingService: BcryptHashingService,
    private readonly sessionService: SessionService,
    private readonly otpVerificationService: OtpVerificationService,
  ) {}

  public async loginEmail(clientInfo: IClientInfo, dto: LoginEmailDto): Promise<OneRoleLoginOutput> {
    return await this.verifyEmailCredentials(clientInfo, dto);
  }

  public async loginPhoneNumber(clientInfo: IClientInfo, dto: LoginPhoneNumberDto): Promise<MessageOutput> {
    const account = await this.getAccountByIdentity(dto.phoneNumber, EAuthProvider.PHONE_NUMBER);

    await this.otpLoginRepository.createPendingSession(clientInfo, dto, account.id);
    await this.otpVerificationService.sendLoginOtp(dto.phoneNumber);

    return { message: 'Verification OTP has been sent to the provided phone number.' };
  }

  public async verifyPhoneNumberCredentials(
    tokenDto: IOpaqueTokenData,
    clientInfo: IClientInfo,
  ): Promise<OneRoleLoginOutput> {
    const state = await this.otpLoginRepository.getSessionByToken(tokenDto.token);

    const account = await this.getAccountById(state.userId);

    return await this.handleRoleBasedLogin(
      EAuthProvider.PHONE_NUMBER,
      clientInfo,
      { deviceInfo: state.deviceInfo, networkMetadata: state.networkMetadata },
      account,
    );
  }

  public async refreshTokens(
    tokenDto: IOpaqueTokenData,
    clientInfo: IClientInfo,
    dto: RefreshTokensDto,
  ): Promise<OneRoleLoginOutput> {
    return await this.sessionService.updateAccessSession(tokenDto, clientInfo, dto);
  }

  public async logout(user: ITokenUserPayload): Promise<OneRoleLoginOutput> {
    await this.sessionService.revokeAccessSession(user.sessionId);

    return {
      accessToken: '',
      refreshToken: '',
      sessionId: '',
    };
  }

  private async verifyEmailCredentials(clientInfo: IClientInfo, dto: LoginEmailDto): Promise<OneRoleLoginOutput> {
    const account = await this.getAccountByIdentity(dto.email, EAuthProvider.EMAIL);

    if (!account.passwordHash) {
      throw new NotFoundException('Incorrect password or email.');
    }

    const isPasswordCorrect = await this.bcryptHashingService.compare(dto.password, account.passwordHash);

    if (!isPasswordCorrect) {
      throw new NotFoundException('Incorrect password or email.');
    }

    return await this.handleRoleBasedLogin(EAuthProvider.EMAIL, clientInfo, dto, account);
  }

  public async handleRoleBasedLogin(
    authProvider: EAuthProvider,
    clientInfo: IClientInfo,
    dto: { deviceInfo: DeviceInfoDto; networkMetadata: NetworkMetadataDto },
    account: User,
  ): Promise<OneRoleLoginOutput> {
    return await this.loginWithOneRole(authProvider, clientInfo, dto, account);
  }

  private async loginWithOneRole(
    authProvider: EAuthProvider,
    clientInfo: IClientInfo,
    dto: { deviceInfo: DeviceInfoDto; networkMetadata: NetworkMetadataDto },
    account: User,
  ): Promise<OneRoleLoginOutput> {
    const [oneRole] = account.roles;

    if (!oneRole) {
      throw new NotFoundException('User has no roles.');
    }

    const userRoleName = oneRole.role.roleName;

    return await this.sessionService.startAccessSession(authProvider, account, userRoleName, clientInfo, dto);
  }

  private async getAccountById(id: string): Promise<User> {
    const account = await this.userRepository.findOneOrFail({
      where: { id: id },
      relations: { roles: { role: true } },
    });

    return account;
  }

  private async getAccountByIdentity(identity: string, authProvider: EAuthProvider): Promise<User> {
    const whereClause = authProvider === EAuthProvider.EMAIL ? { email: identity } : { phoneNumber: identity };

    const account = await this.userRepository.findOne({
      where: whereClause,
      relations: { roles: { role: true } },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    return account;
  }
}

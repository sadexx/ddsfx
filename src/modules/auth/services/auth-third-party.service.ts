import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { AuthRegistrationService } from 'src/modules/auth/services/auth-registration.service';
import { LoginThirdPartyMobileDto } from 'src/modules/auth/common/dto';
import { IClientInfo } from 'src/common/interfaces';
import { EAuthProvider, ERegistrationStrategy } from 'src/modules/auth/common/enums';
import { IStartRegistrationOutput, OneRoleLoginOutput } from 'src/modules/auth/common/outputs';
import { IAppleProviderOutput, IGoogleProviderOutput } from 'src/libs/tokens/common/interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthThirdPartyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly authRegistrationService: AuthRegistrationService,
  ) {}

  public async handleThirdPartyAuth(
    registrationStrategy: ERegistrationStrategy,
    mobileToken: IAppleProviderOutput | IGoogleProviderOutput,
    clientInfo: IClientInfo,
    dto: LoginThirdPartyMobileDto,
  ): Promise<OneRoleLoginOutput | IStartRegistrationOutput> {
    const account = await this.getAccountByIdentity(mobileToken.email);

    if (!account) {
      return this.authRegistrationService.startOathRegistration(registrationStrategy, mobileToken, clientInfo, dto);
    }

    return await this.authService.handleRoleBasedLogin(EAuthProvider.APPLE, clientInfo, dto, account);
  }

  private async getAccountByIdentity(identity: string): Promise<User | null> {
    const account = await this.userRepository.findOne({
      where: { email: identity },
      relations: { roles: { role: true } },
    });

    return account;
  }
}

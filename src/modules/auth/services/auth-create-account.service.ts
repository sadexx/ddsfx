import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User, UserRole } from 'src/modules/users/entities';
import { Repository } from 'typeorm';
import { EAccountStatus } from 'src/modules/users/common/enum';
import { IUserRegistrationCompletion } from 'src/modules/auth/common/interfaces';
import { IRegistrationState } from 'src/libs/temporal-state/common/interfaces';

@Injectable()
export class AuthCreateAccountService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  public async checkEmailUniqueness(email: string): Promise<void> {
    const existingUser = await this.userRepository.exists({ where: { email: email } });

    if (existingUser) {
      throw new BadRequestException('Email is already in use.');
    }
  }

  public async checkPhoneNumberUniqueness(phoneNumber: string): Promise<void> {
    const existingUser = await this.userRepository.exists({ where: { phoneNumber: phoneNumber } });

    if (existingUser) {
      throw new BadRequestException('Phone number is already in use.');
    }
  }

  public async createAccount(dto: IRegistrationState): Promise<User> {
    const role = await this.roleRepository.findOneOrFail({ where: { roleName: dto.roleName } });
    const registrationDto = this.buildUserRegistrationCompletion(dto);
    const newUser = await this.createUser(registrationDto);
    newUser.roles = [await this.createUserRole(role, newUser)];

    return newUser;
  }

  private buildUserRegistrationCompletion(registrationData: IRegistrationState): IUserRegistrationCompletion {
    return {
      authProvider: registrationData.authProvider,
      role: registrationData.roleName,
      email: registrationData.email,
      isVerifiedEmail: registrationData.isVerifiedEmail,
      password: registrationData.password,
      phoneNumber: registrationData.phoneNumber,
      isVerifiedPhoneNumber: registrationData.isVerifiedPhoneNumber,
    };
  }

  private async createUser(dto: IUserRegistrationCompletion): Promise<User> {
    const newUser = this.userRepository.create({
      email: dto.email,
      isEmailVerified: dto.isVerifiedEmail,
      passwordHash: dto.password,
      phoneNumber: dto.phoneNumber,
      isPhoneNumberVerified: dto.isVerifiedPhoneNumber,
    });

    return await this.userRepository.save(newUser);
  }

  private async createUserRole(role: Role, user: User): Promise<UserRole> {
    const newUserRole = this.userRoleRepository.create({
      user: user,
      role: role,
      accountStatus: EAccountStatus.ACTIVE,
    });

    return await this.userRoleRepository.save(newUserRole);
  }
}

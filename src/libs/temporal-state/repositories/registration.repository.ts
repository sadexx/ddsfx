import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NUMBER_OF_HOURS_IN_DAY, NUMBER_OF_HOURS_IN_HOUR, NUMBER_OF_SECONDS_IN_HOUR } from 'src/common/constants';
import { ERegistrationStrategy } from 'src/modules/auth/common/enums';
import { BcryptHashingService } from 'src/libs/hashing/services';
import { RedisService } from 'src/libs/redis/services';
import { IRegistrationState, IStartRegistration } from 'src/libs/temporal-state/common/interfaces';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class RegistrationRepository {
  private readonly REGISTRATION_PREFIX = 'registration';
  private readonly ATTEMPT_PREFIX = 'registration-attempt';
  private readonly REGISTRATION_FLOW_TTL = NUMBER_OF_SECONDS_IN_HOUR * NUMBER_OF_HOURS_IN_HOUR;
  private readonly DAILY_REGISTRATION_LIMIT = 5;
  private readonly REGISTRATION_ATTEMPT_TTL = NUMBER_OF_SECONDS_IN_HOUR * NUMBER_OF_HOURS_IN_DAY;
  private readonly VERIFICATION_ATTEMPT_LIMIT = 5;
  private readonly VERIFICATION_ATTEMPT_INTERVAL_MS = 55000;

  constructor(
    private readonly redisService: RedisService,
    private readonly bcryptHashingService: BcryptHashingService,
  ) {}

  public async createRegistrationState(dto: IStartRegistration, user?: ITokenUserPayload): Promise<void> {
    const redisKey = this.buildRegistrationRedisKey(dto.registrationToken);
    const registrationData = this.buildRegistrationData(dto, user);

    await this.redisService.setJson(redisKey, registrationData, this.REGISTRATION_FLOW_TTL);
  }

  private buildRegistrationData(dto: IStartRegistration, user?: ITokenUserPayload): IRegistrationState {
    return {
      registrationToken: dto.registrationToken,
      registeredUserId: user ? user.sub : null,
      roleName: dto.roleName,
      authProvider: dto.registrationStrategy,
      email: dto.email ? dto.email : null,
      emailVerificationAttempts: 0,
      lastEmailVerificationAttempt: null,
      isVerifiedEmail: dto.isVerifiedEmail ? dto.isVerifiedEmail : false,
      password: null,
      phoneNumber: null,
      phoneVerificationAttempts: 0,
      lastPhoneVerificationAttempt: null,
      isVerifiedPhoneNumber: false,
      isAgreedToConditions: true,
      clientInfo: dto.clientInfo,
      networkMetadata: dto.networkMetadata,
      deviceInfo: dto.deviceInfo,
    };
  }

  public async getRegistration(token: string, key?: string): Promise<IRegistrationState> {
    const redisKey = key ? key : this.buildRegistrationRedisKey(token);
    const data = await this.redisService.getJson<IRegistrationState>(redisKey);

    if (!data) {
      throw new NotFoundException('Registration data not found');
    }

    return data;
  }

  public async recordEmailVerificationAttempt(token: string, email: string): Promise<void> {
    const redisKey = this.buildRegistrationRedisKey(token);
    const registration = await this.getRegistration(token, redisKey);

    if (registration.authProvider !== ERegistrationStrategy.EMAIL) {
      throw new BadRequestException('Email verification not required for this registration strategy');
    }

    if (registration.isVerifiedEmail) {
      throw new BadRequestException('Email already verified');
    }

    this.validateVerificationAttempt(registration.emailVerificationAttempts, registration.lastEmailVerificationAttempt);
    await this.redisService.updateJson(redisKey, {
      ...registration,
      email: email,
      emailVerificationAttempts: registration.emailVerificationAttempts + 1,
      lastEmailVerificationAttempt: new Date().toISOString(),
    });
  }

  public async markEmailVerified(token: string): Promise<void> {
    const redisKey = this.buildRegistrationRedisKey(token);
    const registration = await this.getRegistration(token, redisKey);

    await this.redisService.updateJson(redisKey, {
      ...registration,
      isVerifiedEmail: true,
    });
  }

  public async recordPhoneVerificationAttempt(token: string, phoneNumber: string): Promise<void> {
    const redisKey = this.buildRegistrationRedisKey(token);
    const registration = await this.getRegistration(token, redisKey);

    if (registration.authProvider !== ERegistrationStrategy.PHONE_NUMBER) {
      throw new BadRequestException('Phone number verification not required for this registration strategy');
    }

    if (registration.isVerifiedPhoneNumber) {
      throw new BadRequestException('Phone number already verified');
    }

    this.validateVerificationAttempt(registration.phoneVerificationAttempts, registration.lastPhoneVerificationAttempt);

    await this.redisService.updateJson(redisKey, {
      ...registration,
      phoneNumber: phoneNumber,
      phoneVerificationAttempts: registration.phoneVerificationAttempts + 1,
      lastPhoneVerificationAttempt: new Date().toISOString(),
    });
  }

  public async markPhoneNumberVerified(token: string): Promise<void> {
    const redisKey = this.buildRegistrationRedisKey(token);
    const registration = await this.getRegistration(token, redisKey);

    await this.redisService.updateJson(redisKey, { ...registration, isVerifiedPhoneNumber: true });
  }

  public async setPassword(token: string, password: string): Promise<void> {
    const redisKey = this.buildRegistrationRedisKey(token);
    const registration = await this.getRegistration(token, redisKey);

    if (registration.authProvider !== ERegistrationStrategy.EMAIL) {
      throw new BadRequestException('Password not required for this registration strategy');
    }

    if (registration.password) {
      throw new BadRequestException('Password already set');
    }

    const hashedPassword = await this.bcryptHashingService.hash(password);

    await this.redisService.updateJson(redisKey, { ...registration, password: hashedPassword });
  }

  public async deleteRegistration(token: string): Promise<void> {
    await this.redisService.del(this.buildRegistrationRedisKey(token));
  }

  private buildRegistrationRedisKey(token: string): string {
    return `${this.REGISTRATION_PREFIX}:${token}`;
  }

  public async checkRegistrationAttemptLimit(ipAddress: string): Promise<void> {
    const redisKey = `${this.ATTEMPT_PREFIX}:${ipAddress}`;
    const attemptData = await this.redisService.getJson<{ ipAddress: string; attemptCount: number }>(redisKey);

    if (attemptData) {
      if (attemptData.attemptCount >= this.DAILY_REGISTRATION_LIMIT) {
        throw new BadRequestException('Daily registration attempt limit exceeded');
      }

      attemptData.attemptCount += 1;
      await this.redisService.updateJson(redisKey, attemptData);
    } else {
      const newAttemptData = {
        ipAddress: ipAddress,
        attemptCount: 1,
      };
      await this.redisService.setJson(redisKey, newAttemptData, this.REGISTRATION_ATTEMPT_TTL);
    }
  }

  private validateVerificationAttempt(attempt: number, lastAttemptDate: string | null): void {
    if (attempt >= this.VERIFICATION_ATTEMPT_LIMIT) {
      throw new BadRequestException('Verification attempt limit exceeded');
    }

    if (
      lastAttemptDate &&
      new Date().getTime() - new Date(lastAttemptDate).getTime() < this.VERIFICATION_ATTEMPT_INTERVAL_MS
    ) {
      throw new BadRequestException('Verification attempt too soon. Please wait before trying again.');
    }
  }
}

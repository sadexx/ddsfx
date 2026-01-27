import { BadRequestException, Injectable } from '@nestjs/common';
import { ChangeEmailDto, ChangePhoneNumberDto } from 'src/modules/users/common/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities';
import { Repository } from 'typeorm';
import { OtpVerificationService } from 'src/modules/otp/services';
import { UserContactInfoRepository } from 'src/libs/temporal-state/repositories';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { MessageOutput } from 'src/common/outputs';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import {
  ChangeEmailQuery,
  ChangePhoneNumberQuery,
  TChangeEmail,
  TChangePhoneNumber,
} from 'src/modules/users/common/types';
import { OAUTH_REGISTRATION_STRATEGIES } from 'src/modules/auth/common/constants';

@Injectable()
export class UserContactInfoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userContactInfoRepository: UserContactInfoRepository,
    private readonly otpVerificationService: OtpVerificationService,
  ) {}

  public async changePhoneNumber(dto: ChangePhoneNumberDto, user: ITokenUserPayload): Promise<MessageOutput> {
    const currentUser = await findOneOrFailTyped<TChangePhoneNumber>(
      dto.newPhoneNumber,
      this.userRepository,
      { select: ChangePhoneNumberQuery.select, where: { id: user.sub } },
      'phoneNumber',
    );

    if (currentUser.phoneNumber === dto.newPhoneNumber) {
      throw new BadRequestException('New phone number must be different from the current one');
    }

    const existingUser = await this.userRepository.exists({ where: { phoneNumber: dto.newPhoneNumber } });

    if (existingUser) {
      throw new BadRequestException('Phone number is already in use');
    }

    await this.userContactInfoRepository.createPendingChange(user.sub, dto.newPhoneNumber);
    await this.otpVerificationService.sendChangePhoneNumberOtp(dto.newPhoneNumber);

    return { message: 'Verification OTP has been sent to the provided phone number' };
  }

  public async changeEmail(dto: ChangeEmailDto, user: ITokenUserPayload): Promise<MessageOutput> {
    const currentUser = await findOneOrFailTyped<TChangeEmail>(
      dto.newEmail,
      this.userRepository,
      { select: ChangeEmailQuery.select, where: { id: user.sub } },
      'email',
    );

    if (currentUser.email === dto.newEmail) {
      throw new BadRequestException('New email must be different from the current one');
    }

    if (OAUTH_REGISTRATION_STRATEGIES.includes(currentUser.registrationStrategy)) {
      throw new BadRequestException('Email cannot be changed for OAuth accounts');
    }

    const existingUser = await this.userRepository.exists({ where: { email: dto.newEmail } });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    await this.userContactInfoRepository.createPendingChange(user.sub, dto.newEmail);
    await this.otpVerificationService.sendChangeEmailOtp(dto.newEmail);

    return { message: 'Verification OTP has been sent to the provided email address' };
  }
}

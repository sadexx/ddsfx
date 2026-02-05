import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities';
import { BcryptHashingService } from 'src/libs/hashing/services';
import { ResetPasswordDto, SetPasswordDto, UpdatePasswordDto } from 'src/modules/users/common/dto';
import { IOpaqueTokenData, ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { MessageOutput } from 'src/common/outputs';
import { OtpVerificationService } from 'src/modules/otp/services';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { ResetPasswordQuery, TResetPassword } from 'src/modules/users/common/types';
import { PasswordResetRepository } from 'src/libs/temporal-state/repositories';
import { IClientInfo } from 'src/common/interfaces';

@Injectable()
export class UserPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly bcryptHashingService: BcryptHashingService,
    private readonly otpVerificationService: OtpVerificationService,
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  public async resetPassword(clientInfo: IClientInfo, dto: ResetPasswordDto): Promise<MessageOutput> {
    await this.passwordResetRepository.checkOtpAttemptLimit(clientInfo.ipAddress);
    const account = await findOneOrFailTyped<TResetPassword>(
      dto.email,
      this.userRepository,
      { select: ResetPasswordQuery.select, where: { email: dto.email } },
      'email',
    );

    await this.otpVerificationService.sendResetPasswordOtp(account.email);

    return { message: 'Password reset link has been sent if the email exists.' };
  }

  public async setPassword(tokenDto: IOpaqueTokenData, dto: SetPasswordDto): Promise<MessageOutput> {
    const state = await this.passwordResetRepository.getStateByToken(tokenDto.token);

    const account = await this.userRepository.findOneOrFail({
      select: { id: true },
      where: { email: state.email },
    });

    const hashedPassword = await this.bcryptHashingService.hash(dto.newPassword);
    await this.userRepository.update(account.id, { passwordHash: hashedPassword });

    return { message: 'Password has been set successfully.' };
  }

  public async updatePassword(dto: UpdatePasswordDto, user: ITokenUserPayload): Promise<MessageOutput> {
    const account = await this.userRepository.findOneOrFail({
      select: { id: true, passwordHash: true },
      where: { id: user.sub },
    });

    if (!account.passwordHash) {
      throw new BadRequestException('Password update is not allowed for this account.');
    }

    const isPasswordCorrect = await this.bcryptHashingService.compare(dto.oldPassword, account.passwordHash);

    if (!isPasswordCorrect) {
      throw new BadRequestException('Incorrect password.');
    }

    const hashedPassword = await this.bcryptHashingService.hash(dto.newPassword);

    await this.userRepository.update(account.id, { passwordHash: hashedPassword });

    return { message: 'Password updated successfully.' };
  }
}

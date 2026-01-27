import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities';
import { BcryptHashingService } from 'src/libs/hashing/services';
import { UpdatePasswordDto } from 'src/modules/users/common/dto';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { MessageOutput } from 'src/common/outputs';

@Injectable()
export class UserPasswordService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly bcryptHashingService: BcryptHashingService,
  ) {}

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

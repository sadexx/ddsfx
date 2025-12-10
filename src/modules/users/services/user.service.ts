import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entities';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getUserProfile(user: ITokenUserPayload): Promise<User> {
    const userProfile = await this.userRepository.findOneOrFail({
      where: { id: user.sub },
      relations: { roles: { role: true }, profile: true },
    });

    return userProfile;
  }
}

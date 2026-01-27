import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NUMBER_OF_SECONDS_IN_MINUTE, NUMBER_OF_MINUTES_IN_FIVE_MINUTES } from 'src/common/constants';
import { RedisService } from 'src/libs/redis/services';
import { IUserContactState } from 'src/libs/temporal-state/common/interfaces';
import { User } from 'src/modules/users/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserContactInfoRepository {
  private readonly PENDING_PREFIX: string = 'user-contact-change:pending';
  private readonly STATE_TTL: number = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_FIVE_MINUTES;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  public async createPendingChange(userId: string, newContactValue: string): Promise<void> {
    const redisKey = this.buildPendingKey(newContactValue);
    const changeData: IUserContactState = {
      userId: userId,
      contactValue: newContactValue,
    };
    await this.redisService.setJson(redisKey, changeData, this.STATE_TTL);
  }

  public async changePhoneNumber(phoneNumber: string): Promise<void> {
    const redisKeyValidation = this.buildPendingKey(phoneNumber);
    const state = await this.getPendingChange(phoneNumber);

    await this.userRepository.update(state.userId, { phoneNumber: state.contactValue, isPhoneNumberVerified: true });
    await this.redisService.del(redisKeyValidation);
  }

  public async changeEmail(email: string): Promise<void> {
    const redisKeyValidation = this.buildPendingKey(email);
    const state = await this.getPendingChange(email);

    await this.userRepository.update(state.userId, { email: state.contactValue, isEmailVerified: true });
    await this.redisService.del(redisKeyValidation);
  }

  private async getPendingChange(contactValue: string): Promise<IUserContactState> {
    const redisKey = this.buildPendingKey(contactValue);
    const data = await this.redisService.getJson<IUserContactState>(redisKey);

    if (!data) {
      throw new NotFoundException('User contact data not found');
    }

    return data;
  }

  private buildPendingKey(contactValue: string): string {
    return `${this.PENDING_PREFIX}:${contactValue}`;
  }
}

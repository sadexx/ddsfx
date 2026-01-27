import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { SetUserAvatarDto } from 'src/modules/users/common/dto';
import { User, UserAvatar } from 'src/modules/users/entities';
import { Repository } from 'typeorm';
import { IUserAvatar } from 'src/modules/users/common/interfaces';
import { EUserAvatarStatus } from 'src/modules/users/common/enum';
import { File } from 'src/libs/file-management/entities';
import { HelperService } from 'src/modules/helper/services';

@Injectable()
export class UserAvatarService {
  constructor(
    @InjectRepository(UserAvatar)
    private readonly userAvatarRepository: Repository<UserAvatar>,
    private readonly helperService: HelperService,
  ) {}

  public async setUserAvatar(dto: SetUserAvatarDto, user: ITokenUserPayload): Promise<void> {
    const existingAvatar = await this.userAvatarRepository.exists({ where: { user: { id: user.sub } } });

    if (existingAvatar) {
      throw new BadRequestException('User already has an avatar');
    }

    await this.helperService.ensureFilesExist([dto]);

    await this.constructAndCreateUserAvatar(dto, user);
  }

  private async constructAndCreateUserAvatar(dto: SetUserAvatarDto, user: ITokenUserPayload): Promise<void> {
    const userAvatarDto = this.constructUserAvatarDto(dto, user);
    await this.createUserAvatar(userAvatarDto);
  }

  private async createUserAvatar(dto: IUserAvatar): Promise<void> {
    const newUserAvatar = this.userAvatarRepository.create(dto);
    await this.userAvatarRepository.save(newUserAvatar);
  }

  private constructUserAvatarDto(dto: SetUserAvatarDto, user: ITokenUserPayload): IUserAvatar {
    return {
      user: { id: user.sub } as User,
      file: { id: dto.id } as File,
      status: EUserAvatarStatus.PENDING,
    };
  }
}

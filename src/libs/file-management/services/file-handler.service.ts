import { BadRequestException, Injectable } from '@nestjs/common';
import { TUpdateFile } from 'src/libs/file-management/common/types';
import { IFile } from 'src/libs/file-management/common/interfaces';
import { NUMBER_OF_MILLISECONDS_IN_HOUR, NUMBER_OF_HOURS_IN_DAY } from 'src/common/constants';
import { EFileType } from 'src/libs/file-management/common/enums';
import { UploadFileDto } from 'src/libs/file-management/common/dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAvatar } from 'src/modules/users/entities';
import { Repository } from 'typeorm';
import { EUserAvatarStatus } from 'src/modules/users/common/enum';

@Injectable()
export class FileHandlerService {
  constructor(
    @InjectRepository(UserAvatar)
    private readonly userAvatarRepository: Repository<UserAvatar>,
  ) {}

  public restrictFileUpdateRules(file: TUpdateFile, uploadedFile: IFile, query: UploadFileDto): void {
    const twentyFourHoursAgo = new Date(Date.now() - NUMBER_OF_MILLISECONDS_IN_HOUR * NUMBER_OF_HOURS_IN_DAY);

    if (
      (file.category === EFileType.POST_PHOTOS || file.category === EFileType.POST_VIDEOS) &&
      file.creationDate < twentyFourHoursAgo
    ) {
      throw new BadRequestException('File cannot be updated after 24 hours of upload');
    }

    if (file.extension !== uploadedFile.extension) {
      throw new BadRequestException('File extension cannot be changed during update');
    }

    if (file.category !== query.category) {
      throw new BadRequestException('File category cannot be changed during update');
    }
  }

  public async handleUpdatedFile(file: TUpdateFile): Promise<void> {
    switch (file.category) {
      case EFileType.USER_AVATARS:
        if (!file.userAvatar) {
          return;
        }

        await this.handleUpdatedUserAvatar(file.userAvatar);
        break;
    }
  }

  public async handleUpdatedUserAvatar(userAvatar: NonNullable<TUpdateFile['userAvatar']>): Promise<void> {
    if (userAvatar.status !== EUserAvatarStatus.PENDING) {
      await this.userAvatarRepository.update(userAvatar.id, { status: EUserAvatarStatus.PENDING });
    }
  }
}

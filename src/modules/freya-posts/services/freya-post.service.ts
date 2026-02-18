import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EPostMediaContentType } from 'src/modules/posts/common/enums';
import { Post, PostMediaContent, PostTemplate } from 'src/modules/posts/entities';
import { SettingsService } from 'src/modules/settings/services';
import { EAccountStatus, EUserRoleName } from 'src/modules/users/common/enum';
import { Role, User, UserProfile, UserRole } from 'src/modules/users/entities';
import { DataSource, EntityManager, Repository } from 'typeorm';
import {
  GetFreyaPostTemplateQuery,
  TDeceasedNameDetails,
  TFreyaPostTemplate,
} from 'src/modules/freya-posts/common/types';
import { FileManagementService } from 'src/libs/file-management/services';
import { EFileType } from 'src/libs/file-management/common/enums';
import { freyaUserProfileSeedData, freyaUserSeedData } from 'src/modules/freya-posts/common/seed-data';

@Injectable()
export class FreyaPostService {
  private readonly FREYA_EMAIL: string = 'freya@freya.com';
  private readonly POST_TEMPLATE_TTL: number = 60000;
  private FREYA_USER_ID: string;

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly settingsService: SettingsService,
    private readonly fileManagementService: FileManagementService,
  ) {}

  public async seedFreyaUser(): Promise<void> {
    const existingUser = await this.userRepository.findOne({ where: { email: this.FREYA_EMAIL } });

    if (!existingUser) {
      await this.createSystemUserFreya();
    } else {
      this.FREYA_USER_ID = existingUser.id;
    }
  }

  private async createSystemUserFreya(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const role = await manager.getRepository(Role).findOneOrFail({ where: { roleName: EUserRoleName.ADMIN } });

      const freyaUser = await manager.getRepository(User).save({
        email: this.FREYA_EMAIL,
        ...freyaUserSeedData,
      });

      await manager.getRepository(UserRole).save({
        user: freyaUser,
        role: role,
        accountStatus: EAccountStatus.ACTIVE,
      });

      await manager.getRepository(UserProfile).save({
        ...freyaUserProfileSeedData,
        user: freyaUser,
      });
      this.FREYA_USER_ID = freyaUser.id;
    });
  }

  public async createFirstPostFromFreya(
    manager: EntityManager,
    deceased: TDeceasedNameDetails,
    fileId?: string,
  ): Promise<void> {
    const settings = await this.settingsService.getSettings();
    const postTemplate = await manager.getRepository<TFreyaPostTemplate>(PostTemplate).findOneOrFail({
      select: GetFreyaPostTemplateQuery.select,
      where: { id: settings.firstPostFromFreyaId },
      relations: GetFreyaPostTemplateQuery.relations,
      cache: this.POST_TEMPLATE_TTL,
    });

    const fullText = `${postTemplate.text} ${deceased.firstName} ${deceased.middleName} ${deceased.lastName}`;
    const postFileId = fileId ? fileId : await this.copyTemplateFile(postTemplate.file.id);

    await this.createPostFromFreya(manager, deceased.id, fullText, postFileId);
  }

  private async copyTemplateFile(templateFileId: string): Promise<string> {
    console.log(`Copying template file with ID: ${templateFileId} for Freya's first post.`);

    const copyFile = await this.fileManagementService.copyFile(
      templateFileId,
      { sub: this.FREYA_USER_ID, sessionId: '', roleName: EUserRoleName.ADMIN },
      EFileType.POST_PHOTOS,
    );

    return copyFile.id;
  }

  private async createPostFromFreya(
    manager: EntityManager,
    deceasedId: string,
    text: string,
    fileId: string,
  ): Promise<void> {
    const post = manager.getRepository(Post).create({
      user: { id: this.FREYA_USER_ID },
      deceased: { id: deceasedId },
      replyToPost: null,
      text: text,
    });

    await manager.getRepository(Post).save(post);

    await manager.getRepository(PostMediaContent).save({
      contentType: EPostMediaContentType.POST_MEDIA,
      post: { id: post.id },
      file: { id: fileId },
      order: 0,
    });
  }
}

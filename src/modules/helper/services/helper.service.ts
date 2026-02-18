import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, MoreThan, Repository } from 'typeorm';
import { File } from 'src/libs/file-management/entities';
import { FILE_CONFIG } from 'src/libs/file-management/common/constants';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';

@Injectable()
export class HelperService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(ReferenceCatalog)
    private readonly referenceCatalogRepository: Repository<ReferenceCatalog>,
  ) {}

  public async ensureFilesExist(uploadedFiles: { id: string }[]): Promise<void> {
    const fileIds = uploadedFiles.map((file) => file.id);
    const cutOffDate = new Date(Date.now() - FILE_CONFIG.TIME_LIMIT);
    const existingFilesCount = await this.fileRepository.count({
      where: {
        id: In(fileIds),
        creationDate: MoreThan(cutOffDate),
        postMediaContent: { id: IsNull() },
        deceasedMediaContent: { id: IsNull() },
        userAvatar: { id: IsNull() },
        contactMethod: { id: IsNull() },
        postTemplate: { id: IsNull() },
        referenceCatalog: { id: IsNull() },
      },
    });

    if (existingFilesCount !== fileIds.length) {
      throw new NotFoundException(`One or more files not found, or expired`);
    }
  }

  public async ensureReferencesExist(referenceIds: string[]): Promise<void> {
    const existingReferencesCount = await this.referenceCatalogRepository.count({
      where: { id: In(referenceIds) },
    });

    if (existingReferencesCount !== referenceIds.length) {
      throw new NotFoundException(`One or more references not found`);
    }
  }
}

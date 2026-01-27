import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFile } from 'src/libs/file-management/common/interfaces';
import { UploadFileDto } from 'src/libs/file-management/common/dto';
import { File } from 'src/libs/file-management/entities';
import { EContentType, EFileExtension } from 'src/libs/file-management/common/enums';
import { AwsS3Service } from 'src/libs/aws/s3/services';
import { CloudFrontService } from 'src/libs/aws/cloud-front/services';
import { EntityIdOutput, MessageOutput } from 'src/common/outputs';
import { IS_LOCAL } from 'src/common/constants';
import { SavedFileOutput } from 'src/libs/file-management/common/outputs';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { DeleteFileQuery, TDeleteFile, TUpdateFile, UpdateFileQuery } from 'src/libs/file-management/common/types';
import { findOneOrFailTyped } from 'src/common/utils/find-one-typed';
import { FileHandlerService } from 'src/libs/file-management/services';

@Injectable()
export class FileManagementService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly storageService: AwsS3Service,
    private readonly cloudFrontService: CloudFrontService,
    private readonly fileHandlerService: FileHandlerService,
  ) {}

  public async uploadFile(user: ITokenUserPayload, file: IFile, query: UploadFileDto): Promise<EntityIdOutput> {
    const newFile = this.createFileEntity(user, file, query);
    const savedFile = await this.fileRepository.save(newFile);

    return { id: savedFile.id };
  }

  public async uploadFiles(user: ITokenUserPayload, files: IFile[], query: UploadFileDto): Promise<SavedFileOutput[]> {
    const newFiles = files.map((file) => this.createFileEntity(user, file, query));
    const savedFiles = await this.fileRepository.save(newFiles);
    const savedFileOutputs: SavedFileOutput[] = [];

    for (const [index, file] of Object.entries(savedFiles)) {
      savedFileOutputs.push({
        id: file.id,
        order: Number(index) + 1,
      });
    }

    return savedFileOutputs;
  }

  public async updateFile(
    id: string,
    user: ITokenUserPayload,
    file: IFile,
    query: UploadFileDto,
  ): Promise<MessageOutput> {
    try {
      const fileRecord = await findOneOrFailTyped<TUpdateFile>(id, this.fileRepository, {
        select: UpdateFileQuery.select,
        where: { id: id, category: query.category, uploadedByUserId: user.sub },
        relations: UpdateFileQuery.relations,
      });

      this.fileHandlerService.restrictFileUpdateRules(fileRecord, file, query);

      await this.fileRepository.update(fileRecord.id, {
        ...file,
        category: query.category,
        mimetype: file.mimetype as EContentType,
        extension: file.extension as EFileExtension,
      });
      await this.deleteObjectFromStorage(fileRecord.fileKey);

      await this.fileHandlerService.handleUpdatedFile(fileRecord);

      return { message: 'File updated successfully' };
    } catch (error) {
      await this.deleteObjectFromStorage(file.fileKey);
      throw error;
    }
  }

  public async deleteFile(id: string, user: ITokenUserPayload): Promise<void> {
    const file = await findOneOrFailTyped<TDeleteFile>(id, this.fileRepository, {
      select: DeleteFileQuery.select,
      where: { id: id, uploadedByUserId: user.sub },
    });

    await this.deleteFileAndObject(file);
  }

  private createFileEntity(user: ITokenUserPayload, file: IFile, query: UploadFileDto): File {
    return this.fileRepository.create({
      ...file,
      uploadedByUserId: user.sub,
      category: query.category,
      mimetype: file.mimetype as EContentType,
      extension: file.extension as EFileExtension,
    });
  }

  public async deleteFileAndObject(file: TDeleteFile): Promise<void> {
    await this.deleteObjectFromStorage(file.fileKey);
    await this.fileRepository.delete(file.id);
  }

  public async deleteFilesAndObjects(files: TDeleteFile[]): Promise<void> {
    await this.deleteObjectsFromStorage(files);
    await this.fileRepository.remove(files as File[]);
  }

  private async deleteObjectFromStorage(fileKey: string): Promise<void> {
    await this.storageService.deleteObject(fileKey);

    if (!IS_LOCAL) {
      await this.cloudFrontService.invalidateCache(fileKey);
    }
  }

  private async deleteObjectsFromStorage(files: TDeleteFile[]): Promise<void> {
    const formattedFileKeys = files.map((file) => ({ Key: file.fileKey }));
    await this.storageService.deleteObjects(formattedFileKeys);

    if (!IS_LOCAL) {
      const fileKeys = files.map((file) => file.fileKey);
      await this.cloudFrontService.invalidateCacheBatch(fileKeys);
    }
  }
}

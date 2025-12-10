import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IFile } from 'src/libs/file-management/common/interfaces';
import { UploadFileDto } from 'src/libs/file-management/common/dto';
import { File } from 'src/libs/file-management/entities';
import { EContentType, EFileExtension } from 'src/libs/file-management/common/enums';
import { AwsS3Service } from 'src/libs/aws/s3/services';
import { CloudFrontService } from 'src/libs/aws/cloud-front/services';
import { IMessageOutput } from 'src/common/outputs';
import { IS_LOCAL } from 'src/common/constants';

@Injectable()
export class FileManagementService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly storageService: AwsS3Service,
    private readonly cloudFrontService: CloudFrontService,
  ) {}

  public async uploadFile(file: IFile, query: UploadFileDto): Promise<IMessageOutput> {
    const newFile = this.createFileEntity(file, query);
    await this.fileRepository.save(newFile);

    return { message: 'File uploaded successfully' };
  }

  public async uploadFiles(files: IFile[], query: UploadFileDto): Promise<IMessageOutput> {
    const newFiles = files.map((file) => this.createFileEntity(file, query));
    await this.fileRepository.save(newFiles);

    return { message: 'Files uploaded successfully' };
  }

  public async updateFile(id: string, file: IFile, query: UploadFileDto): Promise<IMessageOutput> {
    const fileRecord = await this.fileRepository.findOne({
      select: { id: true, fileKey: true },
      where: { id: id, category: query.category },
    });

    if (!fileRecord) {
      await this.deleteObjectFromStorage(file.fileKey);
      throw new NotFoundException('File not found');
    }

    await this.fileRepository.update(fileRecord.id, {
      ...file,
      category: query.category,
      mimetype: file.mimetype as EContentType,
      extension: file.extension as EFileExtension,
    });
    await this.deleteObjectFromStorage(fileRecord.fileKey);

    return { message: 'File updated successfully' };
  }

  public async deleteFile(id: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id: id } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.deleteObjectFromStorage(file.fileKey);
    await this.fileRepository.delete(file.id);
  }

  private createFileEntity(file: IFile, query: UploadFileDto): File {
    return this.fileRepository.create({
      ...file,
      category: query.category,
      mimetype: file.mimetype as EContentType,
      extension: file.extension as EFileExtension,
    });
  }

  private async deleteObjectFromStorage(fileKey: string): Promise<void> {
    await this.storageService.deleteObject(fileKey);

    if (!IS_LOCAL) {
      await this.cloudFrontService.invalidateCache(fileKey);
    }
  }
}

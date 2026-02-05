import { Injectable } from '@nestjs/common';
import { DataSource, DeepPartial, EntityManager, ILike } from 'typeorm';
import { Deceased, DeceasedMediaContent } from 'src/modules/deceased/entities';
import { ITransformedMemoryDataset } from 'src/modules/external-sync/common/interfaces';
import { Cemetery, GraveLocation } from 'src/modules/cemetery/entities';
import { BucketLocationConstraint, StorageClass } from '@aws-sdk/client-s3';
import { EBucketName, EContentType, EFileExtension, EFileType } from 'src/libs/file-management/common/enums';
import { File } from 'src/libs/file-management/entities/file.entity';
import { EDeceasedMediaContentType, EDeceasedStatus } from 'src/modules/deceased/common/enums';
import { Address } from 'src/modules/address/entities';

@Injectable()
export class DeceasedCreationService {
  private readonly DEFAULT_MEMORY_FILE_CONFIG: Partial<File> = {
    storageType: 'aws-s3',
    storageClass: StorageClass.STANDARD,
    storageRegion: BucketLocationConstraint.eu_central_1,
    bucketName: EBucketName.FREYA_MEMORY,
    category: EFileType.DECEASED_PHOTOS,
    originalName: 'memory-avatar',
    originalFullName: 'memory-avatar',
    size: 0,
    mimetype: EContentType.IMAGE_JPEG,
    extension: EFileExtension.JPEG,
  };

  constructor(private readonly dataSource: DataSource) {}

  public async createDeceasedFromMemory(deceasedDto: ITransformedMemoryDataset): Promise<Deceased> {
    return await this.dataSource.transaction(async (manager) => {
      return await this.constructAndCreateDeceased(manager, deceasedDto);
    });
  }

  private async constructAndCreateDeceased(
    manager: EntityManager,
    deceasedDto: ITransformedMemoryDataset,
  ): Promise<Deceased> {
    const savedDeceased = await manager
      .getRepository(Deceased)
      .save({ ...deceasedDto, status: EDeceasedStatus.VERIFIED, isFamousPerson: false });

    if (deceasedDto.cemeteryName) {
      await this.createGraveLocationFromMemory(manager, deceasedDto, savedDeceased);
    }

    if (deceasedDto.portraitFileKey) {
      await this.createDeceasedMediaContentFromIndex(
        manager,
        deceasedDto.portraitFileKey,
        savedDeceased,
        EDeceasedMediaContentType.DECEASED_AVATAR,
      );
    }

    if (deceasedDto.filePreviewFileKey) {
      await this.createDeceasedMediaContentFromIndex(
        manager,
        deceasedDto.filePreviewFileKey,
        savedDeceased,
        EDeceasedMediaContentType.DECEASED_GENERAL_PHOTO,
      );
    }

    if (deceasedDto.additionalFilePreviewFileKey) {
      await this.createDeceasedMediaContentFromIndex(
        manager,
        deceasedDto.additionalFilePreviewFileKey,
        savedDeceased,
        EDeceasedMediaContentType.DECEASED_GRAVESTONE_PHOTO,
      );
    }

    return savedDeceased;
  }

  private async createGraveLocationFromMemory(
    manager: EntityManager,
    deceasedDto: ITransformedMemoryDataset,
    deceased: Deceased,
  ): Promise<void> {
    let cemetery = await manager.getRepository(Cemetery).findOne({
      where: { name: ILike(`%${deceasedDto.cemeteryName}%`) },
    });

    if (!cemetery) {
      cemetery = await manager.getRepository(Cemetery).save({ name: deceasedDto.cemeteryName ?? undefined });

      if (
        deceasedDto.gpsLatitude !== null &&
        deceasedDto.gpsLongitude !== null &&
        deceasedDto.regionFullName !== null &&
        deceasedDto.regionName !== null
      ) {
        const addressDto: DeepPartial<Address> = {
          cemetery: cemetery,
          longitude: deceasedDto.gpsLongitude,
          latitude: deceasedDto.gpsLatitude,
          country: 'ukraine',
          region: deceasedDto.regionFullName,
          city: deceasedDto.regionName,
        };

        await manager.getRepository(Address).save(addressDto);
      }
    }

    await manager.getRepository(GraveLocation).save({
      longitude: deceasedDto.gpsLongitude,
      latitude: deceasedDto.gpsLatitude,
      altitude: deceasedDto.gpsAltitude,
      deceased: deceased,
      cemetery: cemetery,
    });
  }

  private async createDeceasedMediaContentFromIndex(
    manager: EntityManager,
    fileKey: string,
    deceased: Deceased,
    contentType: EDeceasedMediaContentType,
  ): Promise<void> {
    const file = await manager.getRepository(File).save({
      ...this.DEFAULT_MEMORY_FILE_CONFIG,
      uploadedByUserId: deceased.id,
      storageKey: fileKey,
      storagePath: fileKey,
      fileKey: fileKey,
    });

    await manager.getRepository(DeceasedMediaContent).save({
      contentType: contentType,
      order: 0,
      file: file,
      deceased: deceased,
    });
  }
}

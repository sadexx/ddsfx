import { Injectable } from '@nestjs/common';
import { IReferenceCatalog } from 'src/modules/reference-catalog/common/interfaces';
import { CreateReferenceCatalogDto, GetReferenceCatalogsDto } from 'src/modules/reference-catalog/common/dto';
import { ReferenceCatalog } from 'src/modules/reference-catalog/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { EntityIdOutput } from 'src/common/outputs';
import { HelperService } from 'src/modules/helper/services';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { GetReferenceCatalogsQuery, TGetReferenceCatalogs } from 'src/modules/reference-catalog/common/types';
import { ESortOrder } from 'src/common/enums';
import { RedisService } from 'src/libs/redis/services';
import { NUMBER_OF_SECONDS_IN_MINUTE, NUMBER_OF_MINUTES_IN_FIVE_MINUTES } from 'src/common/constants';
import { File } from 'src/libs/file-management/entities';

@Injectable()
export class ReferenceCatalogService {
  private readonly DROPDOWN_RESULT_LIMIT: number = 20;
  private readonly DROPDOWN_CACHE_TTL: number = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_FIVE_MINUTES;
  constructor(
    @InjectRepository(ReferenceCatalog)
    private readonly referenceCatalogRepository: Repository<ReferenceCatalog>,
    private readonly redisService: RedisService,
    private readonly helperService: HelperService,
  ) {}

  public async getReferenceCatalogs(dto: GetReferenceCatalogsDto): Promise<TGetReferenceCatalogs[]> {
    const cacheKey = this.buildCacheKey(dto);
    const cacheData = await this.redisService.getJson<TGetReferenceCatalogs[]>(cacheKey);

    if (cacheData) {
      return cacheData;
    }

    const referenceCatalogs = await findManyTyped<TGetReferenceCatalogs[]>(this.referenceCatalogRepository, {
      select: GetReferenceCatalogsQuery.select,
      where: {
        type: dto.type,
        isVerify: true,
        isArchive: false,
        value: ILike(`%${dto.searchField}%`),
      },
      order: {
        creationDate: ESortOrder.DESC,
      },
      take: this.DROPDOWN_RESULT_LIMIT,
    });

    if (referenceCatalogs.length !== 0) {
      await this.redisService.setJson(cacheKey, referenceCatalogs, this.DROPDOWN_CACHE_TTL);
    }

    return referenceCatalogs;
  }

  public async createReferenceCatalog(dto: CreateReferenceCatalogDto): Promise<EntityIdOutput> {
    if (dto.fileId) {
      await this.helperService.ensureFilesExist([{ id: dto.fileId }]);
    }

    const referenceCatalog = await this.constructAndCreateReferenceCatalog(dto);

    return { id: referenceCatalog.id };
  }

  private async constructAndCreateReferenceCatalog(dto: CreateReferenceCatalogDto): Promise<ReferenceCatalog> {
    const referenceCatalogDto = this.constructReferenceCatalogDto(dto);

    return await this.createReference(referenceCatalogDto);
  }

  private async createReference(dto: IReferenceCatalog): Promise<ReferenceCatalog> {
    const newReferenceCatalog = this.referenceCatalogRepository.create(dto);

    return await this.referenceCatalogRepository.save(newReferenceCatalog);
  }

  private constructReferenceCatalogDto(dto: CreateReferenceCatalogDto): IReferenceCatalog {
    return {
      file: dto.fileId ? ({ id: dto.fileId } as File) : null,
      type: dto.type,
      value: dto.value,
      isVerify: false,
      isArchive: false,
    };
  }

  private buildCacheKey(dto: GetReferenceCatalogsDto): string {
    return `reference-catalog:${dto.type}:${dto.searchField.toLowerCase()}`;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { LokiLogger } from 'src/libs/logger';
import { CreateCemeteryDto, GetCemeteriesDto } from 'src/modules/cemetery/common/dto';
import { cemeteriesSeedData } from 'src/modules/cemetery/common/seed-data';
import { GetCemeteriesQuery, TGetCemeteries } from 'src/modules/cemetery/common/types';
import { Cemetery } from 'src/modules/cemetery/entities';
import { RedisService } from 'src/libs/redis/services';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { ESortOrder } from 'src/common/enums';
import { NUMBER_OF_SECONDS_IN_MINUTE, NUMBER_OF_MINUTES_IN_FIVE_MINUTES } from 'src/common/constants';
import { EntityIdOutput } from 'src/common/outputs';
import { ICemetery } from 'src/modules/cemetery/common/interfaces';

@Injectable()
export class CemeteryService {
  private readonly lokiLogger = new LokiLogger(CemeteryService.name);
  private readonly DROPDOWN_RESULT_LIMIT: number = 20;
  private readonly DROPDOWN_CACHE_TTL: number = NUMBER_OF_SECONDS_IN_MINUTE * NUMBER_OF_MINUTES_IN_FIVE_MINUTES;
  constructor(
    @InjectRepository(Cemetery)
    private readonly cemeteryRepository: Repository<Cemetery>,
    private readonly redisService: RedisService,
  ) {}

  public async seedCemeteries(): Promise<void> {
    const existingCemeteries = await this.cemeteryRepository.count();

    if (existingCemeteries === 0) {
      await this.cemeteryRepository.save(cemeteriesSeedData);
      this.lokiLogger.log(`Seeded Cemeteries table, added record for ${cemeteriesSeedData.length} cemeteries`);
    }
  }

  public async getCemeteries(dto: GetCemeteriesDto): Promise<TGetCemeteries[]> {
    const cacheKey = this.buildCacheKey(dto.searchField);
    const cacheData = await this.redisService.getJson<TGetCemeteries[]>(cacheKey);

    if (cacheData) {
      return cacheData;
    }

    const cemeteries = await findManyTyped<TGetCemeteries[]>(this.cemeteryRepository, {
      select: GetCemeteriesQuery.select,
      where: { isVerify: true, name: ILike(`%${dto.searchField}%`) },
      order: { creationDate: ESortOrder.DESC },
      take: this.DROPDOWN_RESULT_LIMIT,
    });

    if (cemeteries.length !== 0) {
      await this.redisService.setJson(cacheKey, cemeteries, this.DROPDOWN_CACHE_TTL);
    }

    return cemeteries;
  }

  public async createCemetery(dto: CreateCemeteryDto): Promise<EntityIdOutput> {
    const cemeteryDto = this.constructReferenceCatalogDto(dto);

    const newCemetery = this.cemeteryRepository.create(cemeteryDto);
    const savedCemetery = await this.cemeteryRepository.save(newCemetery);

    return { id: savedCemetery.id };
  }

  private constructReferenceCatalogDto(dto: CreateCemeteryDto): ICemetery {
    return {
      name: dto.name,
      isVerify: false,
      address: null,
    };
  }

  private buildCacheKey(searchField: string): string {
    return `cemeteries:${searchField.toLowerCase()}`;
  }
}

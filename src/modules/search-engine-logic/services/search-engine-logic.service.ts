import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenSearchService } from 'src/libs/opensearch/services';
import { GetFamousDeceasedDto, SearchQueryDto } from 'src/modules/search-engine-logic/common/dto';
import { SearchEngineQueryOptionsService } from 'src/modules/search-engine-logic/services/search-engine-query-options.service';
import { IPersonOutput } from 'src/modules/search-engine-logic/common/output';
import { RedisService } from 'src/libs/redis/services';
import { NUMBER_OF_MINUTES_IN_HOUR, NUMBER_OF_SECONDS_IN_MINUTE } from 'src/common/constants';
import { SettingsService } from 'src/modules/settings/services';
import { IFastSearchRequest } from 'src/modules/search-engine-logic/common/interfaces';
import { PersonSchema } from 'src/modules/search-engine-logic/schemas';
import { IClientInfo } from 'src/common/interfaces';
import { SearchEventDto } from 'src/modules/web-socket-gateway/common/dto';
import { Deceased } from 'src/modules/deceased/entities';
import { HelperQueryService } from 'src/modules/helper/services';
import { findManyQueryBuilderTyped } from 'src/common/utils/find-many-typed';
import { TLoadDeceasedWithRelations } from 'src/modules/external-sync/common/types';

@Injectable()
export class SearchEngineLogicService {
  private readonly CACHE_TTL: number = NUMBER_OF_MINUTES_IN_HOUR * NUMBER_OF_SECONDS_IN_MINUTE;
  constructor(
    @InjectRepository(Deceased)
    private readonly deceasedRepository: Repository<Deceased>,
    private readonly searchService: OpenSearchService,
    private readonly searchQueryOptionsService: SearchEngineQueryOptionsService,
    private readonly redisService: RedisService,
    private readonly settingsService: SettingsService,
    private readonly helperQueryService: HelperQueryService,
  ) {}

  public async launchSearch(dto: SearchQueryDto | SearchEventDto, clientInfo: IClientInfo): Promise<IPersonOutput[]> {
    const cacheKey = `fast-search-requests:${clientInfo.ipAddress}`;
    const settings = await this.settingsService.getSettings();
    const cacheData = await this.redisService.getJson<IFastSearchRequest>(cacheKey);

    if (!cacheData) {
      const requestId: IFastSearchRequest = {
        clientIpAddress: clientInfo.ipAddress,
        clientUserAgent: clientInfo.userAgent,
        searchCount: 1,
      };
      await this.redisService.setJson(cacheKey, requestId, this.CACHE_TTL);
    } else {
      cacheData.searchCount += 1;
      await this.redisService.updateJson(cacheKey, cacheData);

      if (cacheData.searchCount > settings.fastSearchMaxRequestsPerHour) {
        throw new BadRequestException('Rate limit exceeded. Please try again later.');
      }
    }

    const queryOption = this.searchQueryOptionsService.buildSearchPeopleOptions(dto);
    const result = await this.searchService.search(queryOption);

    const people = result.hits.hits.map((hit) => ({
      ...(hit._source as PersonSchema),
      score: hit._score || 0,
    }));

    return people;
  }

  public async getFamousDeceasedProfile(dto: GetFamousDeceasedDto): Promise<TLoadDeceasedWithRelations[]> {
    const queryBuilder = this.deceasedRepository.createQueryBuilder('deceased');
    this.helperQueryService.loadDeceasedWithRelationsOptions(queryBuilder, {
      cemeteryName: dto.cemeteryName,
      isFamousPerson: true,
    });

    const deceased = await findManyQueryBuilderTyped<TLoadDeceasedWithRelations[]>(queryBuilder);

    return deceased;
  }
}

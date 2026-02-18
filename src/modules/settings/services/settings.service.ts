import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from 'src/modules/settings/entities';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from 'src/modules/settings/common/dto';
import { RedisService } from 'src/libs/redis/services';
import { LokiLogger } from 'src/libs/logger';
import { NUMBER_OF_MINUTES_IN_DAY, NUMBER_OF_SECONDS_IN_MINUTE } from 'src/common/constants';
import { MessageOutput } from 'src/common/outputs';
import { MobileSettingsQuery, SettingsQuery, TMobileSettings, TSettings } from 'src/modules/settings/common/types';
import { findManyTyped } from 'src/common/utils/find-many-typed';
import { settingsSeedData } from 'src/modules/settings/common/seed-data';

@Injectable()
export class SettingsService {
  private readonly lokiLogger = new LokiLogger(SettingsService.name);
  private readonly CACHE_KEY: string = 'global-settings';
  private readonly MOBILE_CACHE_KEY: string = 'mobile-settings';

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    private readonly redisService: RedisService,
  ) {}

  public async seedSettingsToDatabase(): Promise<void> {
    const settingsCount = await this.settingsRepository.count();

    if (settingsCount === 0) {
      const setting = this.settingsRepository.create(settingsSeedData);

      await this.settingsRepository.save(setting);
      this.lokiLogger.log(`Seeded Settings table, added record`);
    }
  }

  public async getSettings(): Promise<TSettings> {
    const CACHE_TTL = NUMBER_OF_MINUTES_IN_DAY * NUMBER_OF_SECONDS_IN_MINUTE;
    const cacheData = await this.redisService.getJson<TSettings>(this.CACHE_KEY);

    if (cacheData) {
      return cacheData;
    }

    const [settings] = await findManyTyped<TSettings[]>(this.settingsRepository, {
      select: SettingsQuery.select,
    });

    if (!settings) {
      throw new NotFoundException('Settings not found in the database.');
    }

    await this.redisService.setJson(this.CACHE_KEY, settings, CACHE_TTL);

    return settings;
  }

  public async getMobileSettings(): Promise<TMobileSettings> {
    const CACHE_TTL = NUMBER_OF_MINUTES_IN_DAY * NUMBER_OF_SECONDS_IN_MINUTE;
    const cacheData = await this.redisService.getJson<TMobileSettings>(this.MOBILE_CACHE_KEY);

    if (cacheData) {
      return cacheData;
    }

    const [settings] = await findManyTyped<TMobileSettings[]>(this.settingsRepository, {
      select: MobileSettingsQuery.select,
    });

    if (!settings) {
      throw new NotFoundException('Settings not found in the database.');
    }

    await this.redisService.setJson(this.MOBILE_CACHE_KEY, settings, CACHE_TTL);

    return settings;
  }

  public async updateSetting(dto: UpdateSettingDto): Promise<MessageOutput> {
    await this.settingsRepository.updateAll(dto);
    await this.redisService.del(this.CACHE_KEY);
    await this.redisService.del(this.MOBILE_CACHE_KEY);

    return { message: 'Settings updated successfully.' };
  }
}

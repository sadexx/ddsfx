import {
  BeforeApplicationShutdown,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LokiLogger } from 'src/libs/logger';
import { SettingsService } from 'src/modules/settings/services';
import { RoleService } from 'src/modules/users/services';
import { CemeteryService } from 'src/modules/cemetery/services';
import { FreyaPostService } from 'src/modules/freya-posts/services';

@Injectable()
export class AppInitializerService
  implements OnModuleInit, OnApplicationBootstrap, BeforeApplicationShutdown, OnApplicationShutdown, OnModuleDestroy
{
  private readonly lokiLogger = new LokiLogger(AppInitializerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
    private readonly roleService: RoleService,
    private readonly cemeteryService: CemeteryService,
    private readonly freyaPostService: FreyaPostService,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.lokiLogger.verbose(`🔵 AppInitializerService initialized`);
    await this.initializeDefaultTasks();
  }

  public onApplicationBootstrap(): void {
    this.lokiLogger.log(`🟢 AppInitializerService bootstrapped`);
  }

  public beforeApplicationShutdown(): void {
    this.lokiLogger.warn(`🟠 AppInitializerService is about to shut down...`);
  }

  public onApplicationShutdown(signal: string): void {
    this.lokiLogger.fatal(`🔴 AppInitializerService received shutdown signal: ${signal}`);
  }

  public onModuleDestroy(): void {
    this.lokiLogger.debug(`⚫ AppInitializerService module is being destroyed`);
  }

  private async initializeDefaultTasks(): Promise<void> {
    const firstLaunch = this.configService.getOrThrow<boolean>('FIRST_LAUNCH');

    if (firstLaunch) {
      await this.settingsService.seedSettingsToDatabase();
      await this.roleService.seedRoles();
      await this.cemeteryService.seedCemeteries();
      await this.freyaPostService.seedFreyaUser();
    }
  }
}

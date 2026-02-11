import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { MessageOutput } from 'src/common/outputs';
import { NotEmptyBodyPipe } from 'src/common/pipes';
import { SettingsService } from 'src/modules/settings/services';
import { UpdateSettingDto } from 'src/modules/settings/common/dto';
import { TMobileSettings, TSettings } from 'src/modules/settings/common/types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  public async getSettings(): Promise<TSettings> {
    return this.settingsService.getSettings();
  }

  @Get('mobile')
  public async getMobileSettings(): Promise<TMobileSettings> {
    return this.settingsService.getMobileSettings();
  }

  @Patch()
  @UsePipes(NotEmptyBodyPipe)
  @RouteSchema({ body: UpdateSettingDto.schema, response: { 200: MessageOutput.schema } })
  async update(@Body() dto: UpdateSettingDto): Promise<MessageOutput> {
    return this.settingsService.updateSetting(dto);
  }
}

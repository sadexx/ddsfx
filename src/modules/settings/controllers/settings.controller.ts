import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { RouteSchema } from '@nestjs/platform-fastify';
import { IMessageOutput } from 'src/common/outputs';
import { NotEmptyBodyPipe } from 'src/common/pipes';
import { SettingsService } from 'src/modules/settings/services';
import { UpdateSettingDto } from 'src/modules/settings/common/dto';
import { TSettings } from 'src/modules/settings/common/types';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RouteSchema({ response: { 200: UpdateSettingDto.schema } })
  public async findAll(): Promise<TSettings> {
    return this.settingsService.getSettings();
  }

  @Patch()
  @UsePipes(NotEmptyBodyPipe)
  @RouteSchema({ body: UpdateSettingDto.schema, response: { 200: IMessageOutput.schema } })
  async update(@Body() dto: UpdateSettingDto): Promise<IMessageOutput> {
    return this.settingsService.updateSetting(dto);
  }
}

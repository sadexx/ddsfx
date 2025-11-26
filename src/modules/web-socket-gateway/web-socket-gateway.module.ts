import { Module } from '@nestjs/common';
import { ConnectionStorageService } from 'src/modules/web-socket-gateway/common/storages';
import { CustomPrometheusModule } from 'src/libs/prometheus/prometheus.module';
import { SearchGateway } from 'src/modules/web-socket-gateway/ws-gateway/search.gateway';
import { SearchEngineLogicModule } from 'src/modules/search-engine-logic/search-engine-logic.module';

@Module({
  imports: [CustomPrometheusModule, SearchEngineLogicModule],
  providers: [SearchGateway, ConnectionStorageService],
  exports: [],
})
export class WebSocketGatewayModule {}

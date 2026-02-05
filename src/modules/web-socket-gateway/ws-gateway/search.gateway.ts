import { OnModuleDestroy, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  GatewayMetadata,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from 'src/common/filters';
import { LokiLogger } from 'src/libs/logger';
import { NUMBER_OF_MILLISECONDS_IN_SECOND } from 'src/common/constants';
import { PrometheusService } from 'src/libs/prometheus/services';
import { ConnectionStorageService } from 'src/modules/web-socket-gateway/common/storages';
import { WebSocketAuthMiddleware } from 'src/modules/web-socket-gateway/common/middlewares';
import { EConnectionTypes, EWebSocketEventTypes } from 'src/modules/web-socket-gateway/common/enum';
import { SearchEventDto } from 'src/modules/web-socket-gateway/common/dto/search-event.dto';
import { SearchEngineLogicService } from 'src/modules/search-engine-logic/services';
import { WsValidationPipe } from 'src/common/pipes';
import { SearchQueryDto } from 'src/modules/search-engine-logic/common/dto';

@WebSocketGateway(SearchGateway.getGatewayOptions())
@UseFilters(WsExceptionFilter)
export class SearchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer() server: Server;
  private readonly lokiLogger = new LokiLogger('SearchGateway');

  constructor(
    private readonly prometheusService: PrometheusService,
    private readonly connectionStorageService: ConnectionStorageService,
    private readonly searchEngineLogicService: SearchEngineLogicService,
  ) {}

  public static getGatewayOptions(): GatewayMetadata {
    return {
      namespace: '/search',
      transports: ['websocket'],
      cookie: true,
      cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingInterval: 15000,
      pingTimeout: 10000,
    };
  }

  public afterInit(server: Server): void {
    this.lokiLogger.log('Events WebSocket initialized');
    server.use(WebSocketAuthMiddleware());
  }

  public async handleConnection(client: Socket): Promise<void> {
    this.lokiLogger.log(`Client connected: ${client.id}, User ID: ${client.user.id}`);

    await this.connectionStorageService.addConnection(EConnectionTypes.SEARCH, client.user.id, client);
    this.prometheusService.connectedClientsGauge.inc();
  }

  public async handleDisconnect(client: Socket): Promise<void> {
    this.lokiLogger.log(`Client disconnected: ${client.id}, User ID: ${client.user.id}`);

    const connectionData = await this.connectionStorageService.getConnection(EConnectionTypes.SEARCH, client.user.id);

    if (connectionData) {
      const connectionDuration = (Date.now() - connectionData.connectTime) / NUMBER_OF_MILLISECONDS_IN_SECOND;
      this.prometheusService.incrementCounter(connectionDuration);
    }

    await this.connectionStorageService.removeConnection(EConnectionTypes.SEARCH, client.user.id);
    this.prometheusService.connectedClientsGauge.dec();
  }

  public onModuleDestroy(): void {
    this.lokiLogger.log('Events WebSocket server is shutting down...');
    this.server.disconnectSockets();
  }

  @SubscribeMessage('message')
  public async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new WsValidationPipe(SearchEventDto)) message: SearchEventDto,
  ): Promise<void> {
    switch (message.event) {
      case EWebSocketEventTypes.SEARCH_REQUEST: {
        const searchResults = await this.searchEngineLogicService.launchSearch(message as unknown as SearchQueryDto, {
          ipAddress: client.user.clientIpAddress,
          userAgent: client.user.clientUserAgent,
        });

        this.prometheusService.messagesSentCounter.inc();
        client.emit(EWebSocketEventTypes.SEARCH_REQUEST, {
          data: searchResults,
        });
        break;
      }

      default:
        this.lokiLogger.error(`Unhandled event: ${JSON.stringify(message.event)}`);
        await this.handleDisconnect(client);
    }
  }
}

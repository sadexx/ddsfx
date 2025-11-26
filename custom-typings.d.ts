// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FastifyRequest } from 'fastify';
import { IWebSocketUserData } from './src/modules/web-socket-gateway/common/interfaces/ws-user-data.interface';

declare module 'fastify' {
  interface FastifyRequest {
    startTime: [number, number];
  }
}

declare module 'socket.io' {
  export interface Socket {
    user: IWebSocketUserData;
  }
}

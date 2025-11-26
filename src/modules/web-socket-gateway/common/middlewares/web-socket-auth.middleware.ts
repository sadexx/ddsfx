import { UnauthorizedException } from '@nestjs/common';
import { ExtendedError, Socket } from 'socket.io';
import { LokiLogger } from 'src/libs/logger';
import { extractClientIp, generateUuidV7 } from 'src/common/utils';
import { IS_LOCAL } from 'src/common/constants';

const lokiLogger = new LokiLogger('WebSocketAuthMiddleware');

export const WebSocketAuthMiddleware = () => {
  return (client: Socket, next: (err?: ExtendedError) => void): void => {
    try {
      const socketAuthData = parseSocketHandshakeData(client);

      if (!socketAuthData) {
        lokiLogger.error('Unauthorized: No socket authentication data provided');

        return next(new UnauthorizedException('Unauthorized'));
      }

      client.user = {
        id: generateUuidV7(),
        clientIpAddress: socketAuthData.address,
        clientUserAgent: socketAuthData.userAgent,
      };

      next();
    } catch (error) {
      lokiLogger.error(`Unauthorized: Invalid token: ${(error as Error).message}, ${(error as Error).stack}`);
      next(new UnauthorizedException('Unauthorized'));
    }
  };
};

const parseSocketHandshakeData = (socket: Socket): { address: string; userAgent: string } | null => {
  const { address, headers } = socket.handshake;

  let ipAddress: string | undefined = address;

  if (!IS_LOCAL) {
    ipAddress = extractClientIp(headers);
  }

  if (!ipAddress || !headers['user-agent']) {
    return null;
  }

  return { address: ipAddress, userAgent: headers['user-agent'] };
};

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  ConnectionError,
  NoLivingConnectionsError,
  OpenSearchClientError,
  ResponseError,
  TimeoutError,
} from '@opensearch-project/opensearch/lib/errors.js';
import { Socket } from 'socket.io';
import { LokiLogger } from 'src/libs/logger';
import { EWebSocketEventTypes } from 'src/modules/web-socket-gateway/common/enum';
import { QueryFailedError } from 'typeorm';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly lokiLogger = new LokiLogger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();
    let exceptionStatus: string = 'error';
    let defaultMessage: string | object = 'Unexpected error occurred';

    if (exception instanceof WsException) {
      defaultMessage = exception.getError();
      client.emit(EWebSocketEventTypes.EXCEPTION, { status: exceptionStatus, message: defaultMessage });
    } else if (exception instanceof UnauthorizedException) {
      exceptionStatus = 'unauthorized';
      defaultMessage = exception.message || 'Unauthorized';
      client.emit(EWebSocketEventTypes.EXCEPTION, { status: exceptionStatus, message: defaultMessage });
    } else if (exception instanceof OpenSearchClientError) {
      const openSearchResult = this.handleOpenSearchError(exception);
      defaultMessage = openSearchResult;
      client.emit(EWebSocketEventTypes.EXCEPTION, { status: exceptionStatus, message: defaultMessage });
    } else if (exception instanceof QueryFailedError) {
      this.lokiLogger.error(`Database error: ${exception.message}`, exception.stack);
      defaultMessage = 'Database Error';
    } else {
      client.emit(EWebSocketEventTypes.EXCEPTION, { status: exceptionStatus, message: defaultMessage });
    }

    if (exceptionStatus !== 'unauthorized') {
      this.lokiLogger.error(`Exception caught: ${JSON.stringify(defaultMessage)}`, (exception as Error).stack);
    }
  }

  private handleOpenSearchError(exception: OpenSearchClientError): string {
    if (exception instanceof ResponseError) {
      const statusCode = exception.statusCode || exception.meta?.statusCode;
      let message: string;

      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          message = 'Invalid search request';
          break;
        case HttpStatus.NOT_FOUND:
          message = 'Resource not found';
          break;
        case HttpStatus.CONFLICT:
          message = 'Search index conflict';
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          message = 'Search service rate limit exceeded';
          break;
        default:
          message = 'Search service error';
      }

      return message;
    }

    if (exception instanceof ConnectionError) {
      return 'Search service temporarily unavailable';
    }

    if (exception instanceof TimeoutError) {
      return 'Search request timeout';
    }

    if (exception instanceof NoLivingConnectionsError) {
      return 'Search service unavailable';
    }

    return 'Search service error';
  }
}

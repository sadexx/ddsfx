import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { LokiLogger } from 'src/libs/logger';
import { PrometheusService } from 'src/libs/prometheus/services';
import { IErrorResponse } from 'src/common/interfaces';
import { FastifyRequest } from 'fastify';
import { FastifyReply } from 'fastify/types/reply';
import { QueryFailedError } from 'typeorm';
import {
  ConnectionError,
  NoLivingConnectionsError,
  OpenSearchClientError,
  ResponseError,
  TimeoutError,
} from '@opensearch-project/opensearch/lib/errors.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly lokiLogger = new LokiLogger(GlobalExceptionFilter.name);
  constructor(private readonly prometheusService: PrometheusService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();
    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let defaultMessage: string = 'Unexpected error occurred';
    let exceptionResponse: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      exceptionResponse = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      this.lokiLogger.error(`Database error: ${exception.message}`, exception.stack);
      defaultMessage = 'Database Error';
    } else if (exception instanceof OpenSearchClientError) {
      const openSearchResult = this.handleOpenSearchError(exception);
      status = openSearchResult.status;
      defaultMessage = openSearchResult.message;
    }

    const responseErrorBody = this.buildErrorResponse(status, request.url, defaultMessage, exceptionResponse);

    this.lokiLogger.error(JSON.stringify(responseErrorBody.message), (exception as Error).stack);
    this.recordErrorMetrics(request, status);

    response.status(status).send(responseErrorBody);
  }

  private handleOpenSearchError(exception: OpenSearchClientError): {
    status: HttpStatus;
    message: string;
  } {
    if (exception instanceof ResponseError) {
      const statusCode = exception.statusCode || exception.meta?.statusCode;
      let httpStatus: HttpStatus;
      let message: string;

      switch (statusCode) {
        case HttpStatus.BAD_REQUEST:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Invalid search request';
          break;
        case HttpStatus.NOT_FOUND:
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          break;
        case HttpStatus.CONFLICT:
          httpStatus = HttpStatus.CONFLICT;
          message = 'Search index conflict';
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          httpStatus = HttpStatus.TOO_MANY_REQUESTS;
          message = 'Search service rate limit exceeded';
          break;
        default:
          httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Search service error';
      }

      return {
        status: httpStatus,
        message: message,
      };
    }

    if (exception instanceof ConnectionError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Search service temporarily unavailable',
      };
    }

    if (exception instanceof TimeoutError) {
      return {
        status: HttpStatus.REQUEST_TIMEOUT,
        message: 'Search request timeout',
      };
    }

    if (exception instanceof NoLivingConnectionsError) {
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Search service unavailable',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Search service error',
    };
  }

  private recordErrorMetrics(request: FastifyRequest, statusCode: number): void {
    const method = request.method;
    const route: string = request.url.startsWith('/v1') ? request.url : 'scam';

    const startTime = request.startTime;
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const secondsToNanoseconds: number = 1e9;
    const durationInSeconds = seconds + nanoseconds / secondsToNanoseconds;

    this.prometheusService.recordHttpRequestDuration(method, route, statusCode, durationInSeconds);
  }

  private buildErrorResponse(
    statusCode: number,
    path: string,
    defaultMessage: string,
    exceptionResponse: unknown,
  ): IErrorResponse {
    const baseResponse: IErrorResponse = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: path,
      message: defaultMessage,
    };

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseObj: { message?: string | string[]; details?: IErrorResponse['details'] } = exceptionResponse;

      if (typeof responseObj.message === 'string') {
        baseResponse.message = responseObj.message;
      }

      if (Array.isArray(responseObj.message)) {
        baseResponse.message = responseObj.message;
      }

      if (Array.isArray(responseObj.details)) {
        baseResponse.details = responseObj.details;
      }
    } else if (typeof exceptionResponse === 'string') {
      baseResponse.message = exceptionResponse;
    }

    return baseResponse;
  }
}

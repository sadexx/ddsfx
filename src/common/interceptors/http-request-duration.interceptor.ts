import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from 'src/libs/prometheus/services';

@Injectable()
export class HttpRequestDurationInterceptor<T = unknown> implements NestInterceptor<T, T> {
  constructor(private readonly prometheusService: PrometheusService) {}

  /**
   * Records the duration of the HTTP request to Prometheus.
   *
   * @param context The execution context of the current HTTP request.
   * @param next The handler to call next in the interceptor chain.
   *
   * @returns An observable containing the response of the next handler.
   */
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const response = httpContext.getResponse<FastifyReply>();
    const method = request.method;
    const route: string = request.url ?? 'unknown';
    const statusCode: number = response.statusCode || HttpStatus.PARTIAL_CONTENT;

    return next.handle().pipe(
      tap(() => {
        const [seconds, nanoseconds] = process.hrtime(request.startTime);
        const SECONDS_TO_NANOSECONDS: number = 1e9;
        const durationInSeconds = seconds + nanoseconds / SECONDS_TO_NANOSECONDS;

        this.prometheusService.recordHttpRequestDuration(method, route, statusCode, durationInSeconds);
      }),
    );
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { LokiLogger } from 'src/libs/logger';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly lokiLogger = new LokiLogger(HttpLoggingInterceptor.name);

  /**
   * Logs HTTP requests and responses to Loki.
   *
   * @param context The execution context of the current HTTP request.
   * @param next The handler to call next in the interceptor chain.
   *
   * @returns An observable containing the response of the next handler.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const method = req.method;
    const url = req.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          const message = `${method} ${url} ${responseTime}ms`;

          this.lokiLogger.logHttpWithoutPrint(message);
        },
        error: (error: Error) => {
          const responseTime = Date.now() - now;
          const message = `${method} ${url} failed in ${responseTime}ms`;
          this.lokiLogger.errorWithoutPrint(message, error.stack);
        },
      }),
    );
  }
}

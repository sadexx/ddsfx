import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { FastifyReply } from 'fastify';
import { RESPONSE_SCHEMA_KEY } from 'src/common/decorators';
import { TSchema } from '@sinclair/typebox';
import fastJson from 'fast-json-stringify';

@Injectable()
export class FastifySerializerInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  /**
   * Serialize the response with Fastify according to the response schema
   * specified in the `@SerializeResponse` decorator.
   *
   * @param context The execution context of the current HTTP request.
   * @param next The handler to call next in the interceptor chain.
   *
   * @returns An observable containing the serialized response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<FastifyReply>();

    const schema: TSchema | undefined = this.reflector.get(RESPONSE_SCHEMA_KEY, context.getHandler());

    if (schema) {
      const serializer = fastJson(schema as never);
      response.serializer(serializer);
    }

    return next.handle();
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IClientInfo } from 'src/common/interfaces';

/**
 * A decorator that extracts client information from the request.
 *
 * @returns A custom decorator that extracts `IClientInfo`.
 */
export const ClientInfo = createParamDecorator((_data: unknown, ctx: ExecutionContext): IClientInfo => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest>();

  return {
    userAgent: request.headers['user-agent'] || '',
    ipAddress: request.ip || '',
  };
});

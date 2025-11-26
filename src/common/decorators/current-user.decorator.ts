import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ITokenUserPayload } from 'src/libs/tokens/common/interfaces';

/**
 * A decorator that extracts the current authenticated user from the request.
 *
 * @returns A custom decorator that extracts `ITokenUserPayload`.
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest & { user?: ITokenUserPayload }>();

  return request.user;
});

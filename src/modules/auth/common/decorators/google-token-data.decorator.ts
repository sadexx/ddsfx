import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IGoogleProviderOutput } from 'src/libs/tokens/common/interfaces';

export const GoogleTokenData = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest & { idToken?: IGoogleProviderOutput }>();

  return request.idToken;
});

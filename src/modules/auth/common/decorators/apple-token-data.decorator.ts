import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IAppleProviderOutput } from 'src/libs/tokens/common/interfaces';

export const AppleTokenData = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest & { idToken?: IAppleProviderOutput }>();

  return request.idToken;
});

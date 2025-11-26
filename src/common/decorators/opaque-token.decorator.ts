import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';

/**
 * A decorator that extracts opaque token metadata from the request.
 *
 * @returns A custom decorator that extracts `IOpaqueTokenData`.
 */
export const OpaqueToken = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest & { opaqueTokenMetadata?: IOpaqueTokenData }>();

  return request.opaqueTokenMetadata;
});

import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FastifyReply } from 'fastify/types/reply';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  /**
   * Records the start time of the request in the Fastify request object.
   * This is used to calculate the duration of the request later.
   * @param req The Fastify request object.
   * @param _res The Fastify response object.
   * @param next The next function in the middleware chain.
   */
  use(req: FastifyRequest, _res: FastifyReply, next: () => void): void {
    req.startTime = process.hrtime();
    next();
  }
}

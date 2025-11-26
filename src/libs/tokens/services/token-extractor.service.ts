import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ETokenSource } from 'src/libs/tokens/common/enums';
import { IExtractionStrategy } from 'src/libs/tokens/common/interfaces';

@Injectable()
export class TokenExtractorService {
  private readonly BEARER_PREFIX: string = 'Bearer ';

  /**
   * Extract token from request using multiple strategies
   * @param request Fastify request
   * @param strategies Extraction strategies
   * @returns Extracted token, or null if extraction failed
   */
  public extract(request: FastifyRequest, strategies: IExtractionStrategy[]): string | null {
    for (const strategy of strategies) {
      const token = this.extractByStrategy(request, strategy);

      if (token) {
        return token;
      }
    }

    return null;
  }

  /**
   * Extract token from request using a single strategy
   * @param request Fastify request
   * @param strategy Extraction strategy
   * @returns Extracted token, or null if extraction failed
   */
  private extractByStrategy(request: FastifyRequest, strategy: IExtractionStrategy): string | null {
    switch (strategy.source) {
      case ETokenSource.COOKIE: {
        return request.cookies?.[strategy.key] ?? null;
      }

      case ETokenSource.HEADER: {
        const authHeader = request.headers.authorization;

        if (!authHeader?.startsWith(this.BEARER_PREFIX)) {
          return null;
        }

        return authHeader.substring(this.BEARER_PREFIX.length);
      }

      case ETokenSource.BODY: {
        const token = (request.body as Record<string, unknown>)?.[strategy.key];

        if (typeof token !== 'string') {
          return null;
        }

        return token;
      }

      default: {
        return null;
      }
    }
  }
}

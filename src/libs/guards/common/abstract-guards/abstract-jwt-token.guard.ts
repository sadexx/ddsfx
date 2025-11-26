import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IExtractionStrategy, ITokenUserPayload } from 'src/libs/tokens/common/interfaces';
import { TokenService } from 'src/libs/tokens/services';

/**
 * Abstract base class for JWT-based authentication guards.
 *
 * @description
 * Implements the Template Method pattern for JWT token validation. Subclasses customize
 * token extraction strategies and verification logic while inheriting the core authentication flow.
 *
 * ## Authentication Flow
 *
 * 1. **Extract Token** - Retrieves JWT from request (cookie, header, or query param)
 * 2. **Verify Token** - Validates JWT signature, expiration, and claims
 * 3. **Attach User Data** - Stores decoded user information in `request.user`
 * 4. **Grant Access** - Returns `true` to allow request to proceed
 *
 * ## Template Method Pattern
 *
 * Fixed algorithm (`canActivate`) with customizable steps:
 * - {@link getExtractionStrategies} - Where to find the token (cookie, header, etc.)
 * - {@link verifyAccessToken} - How to validate and decode the token
 *
 * ## Request Mutation
 *
 * On successful authentication, attaches user data to request:
 * ```typescript
 * request.user = {
 *   sub: "01h2x3y4z5...",        // User ID
 *   sessionId: "01h2x3y4z6...",  // Session ID
 *   roleName: "user"              // User role
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws {@link UnauthorizedException} (HTTP 401) when:
 * - Token not found in request
 * - Token signature invalid
 * - Token expired
 * - Token verification fails for any reason
 *
 */
@Injectable()
export abstract class AbstractJwtTokenGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: ITokenUserPayload }>();
    const token = this.tokenService.extract(request, this.getExtractionStrategies());

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tokenData = await this.verifyAccessToken(token);

    if (!tokenData) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = tokenData;

    return true;
  }

  protected abstract getExtractionStrategies(): IExtractionStrategy[];
  protected abstract verifyAccessToken(token: string): Promise<ITokenUserPayload>;
}

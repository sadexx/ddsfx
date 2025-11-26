import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IExtractionStrategy, IOpaqueTokenData } from 'src/libs/tokens/common/interfaces';
import { TokenService } from 'src/libs/tokens/services';

/**
 * Abstract base class for opaque token authentication guards.
 *
 * @description
 * Implements the Template Method pattern for opaque token validation.
 * Opaque tokens are server-generated, used for managing temporary session state
 * during flows like `registration`, `role selection`, or `refresh token` management.
 *
 * ## Opaque Token Characteristics
 *
 * - **Format:** Custom (e.g., `reg.v1.randomBytes.expiration.hmac`)
 * - **Validation:** Server-side lookup and HMAC signature verification
 * - **Use Cases:** `Registration flow`, `refresh tokens`, `role selection`
 *
 * ## Authentication Flow
 *
 * 1. **Extract Token** - Retrieves opaque token from request (typically cookie)
 * 2. **Parse & Verify** - Validates token structure, signature (HMAC), and expiration
 * 3. **Attach Metadata** - Stores token data in `request.opaqueTokenMetadata`
 * 4. **Grant Access** - Returns `true` to allow request to proceed
 *
 * ## Template Method Pattern
 *
 * Fixed algorithm (`canActivate`) with customizable steps:
 * - {@link getExtractionStrategies} - Where to find the token
 * - {@link parseAndVerify} - How to validate the token
 *
 * ## Request Mutation
 *
 * On successful authentication, attaches token metadata to request:
 * ```typescript
 * request.opaqueTokenMetadata = {
 *   type: 'reg',              // Token type (reg, ref, rol)
 *   version: 'v1',            // Token format version
 *   random: 'abc123...',      // Random component
 *   exp: 1730210400,          // Expiration timestamp
 *   hmac: 'def456...',        // HMAC signature
 *   token: 'reg.v1.abc...'    // Original token string
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws {@link UnauthorizedException} (HTTP 401) when:
 * - Token not found in request
 * - Token structure malformed
 * - Token signature (HMAC) invalid
 * - Token expired
 * - Token type mismatch (e.g., refresh token used in registration guard)
 *
 */

@Injectable()
export abstract class AbstractOpaqueTokenGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { opaqueTokenMetadata?: IOpaqueTokenData }>();
    const token = this.tokenService.extract(request, this.getExtractionStrategies());

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tokenData = await this.parseAndVerify(token);

    if (!tokenData) {
      throw new UnauthorizedException('Invalid token');
    }

    request.opaqueTokenMetadata = tokenData;

    return true;
  }

  protected abstract getExtractionStrategies(): IExtractionStrategy[];
  protected abstract parseAndVerify(token: string): Promise<IOpaqueTokenData | null>;
}

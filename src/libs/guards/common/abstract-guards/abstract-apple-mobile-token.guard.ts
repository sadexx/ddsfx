import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { TokenService } from 'src/libs/tokens/services';
import { IAppleProviderOutput, IExtractionStrategy } from 'src/libs/tokens/common/interfaces';

/**
 * Abstract base class for Apple Sign-In authentication guards.
 *
 * @description
 * Implements the Template Method pattern for Apple identity token validation. Subclasses customize
 * token extraction strategies and verification logic while inheriting the core authentication flow.
 *
 * This guard is specifically designed for Apple's mobile authentication flow, where the client
 * receives an identity token (ID token) from Apple's authentication service.
 *
 * ## Authentication Flow
 *
 * 1. **Extract Token** - Retrieves Apple ID token from request (header, body, or query param)
 * 2. **Verify Token** - Validates token with Apple's public keys (JWKS), checks signature, issuer, audience, and expiration
 * 3. **Attach Apple Data** - Stores decoded Apple user information in `request.idToken`
 * 4. **Grant Access** - Returns `true` to allow request to proceed
 *
 * ## Template Method Pattern
 *
 * Fixed algorithm (`canActivate`) with customizable steps:
 * - {@link getExtractionStrategies} - Where to find the token (header, body, query param, etc.)
 * - {@link verifyAppleToken} - How to validate and decode the Apple identity token
 *
 * ## Request Mutation
 *
 * On successful authentication, attaches Apple user data to request:
 * ```typescript
 * request.idToken = {
 *   email: "user@privaterelay.appleid.com",  // User's email (may be private relay)
 *   isVerifiedEmail: true,                    // Email verification status
 *   isPrivateEmail: true,                     // Whether Apple private relay is used
 *   realUserStatus: 1                         // Apple's user authenticity indicator (0=unsupported, 1=likely real, 2=high confidence)
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws {@link UnauthorizedException} (HTTP 401) when:
 * - Token not found in request
 * - Token signature invalid (doesn't match Apple's public keys)
 * - Token issuer is not `https://appleid.apple.com`
 * - Token audience doesn't match configured app bundle ID
 * - Token expired or used before valid time
 * - Token verification fails for any reason
 *
 * ## Apple Token Validation
 *
 * The guard verifies Apple identity tokens against Apple's specifications:
 * - **Issuer**: Must be `https://appleid.apple.com`
 * - **Audience**: Must match your app's bundle identifier (e.g., `com.freyadev`)
 * - **Signature**: Validated using Apple's public keys from `https://appleid.apple.com/auth/keys`
 * - **Claims**: Extracts user email, email verification status, and privacy settings
 *
 * @see {@link https://developer.apple.com/documentation/sign_in_with_apple Apple Sign-In Documentation}
 * @see {@link https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user Apple Token Verification}
 *
 */
@Injectable()
export abstract class AbstractAppleMobileTokenGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { idToken?: IAppleProviderOutput }>();

    const token = this.tokenService.extract(request, this.getExtractionStrategies());

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tokenData = await this.verifyAppleToken(token);

    if (!tokenData) {
      throw new UnauthorizedException('Invalid token');
    }

    request.idToken = tokenData;

    return true;
  }

  protected abstract getExtractionStrategies(): IExtractionStrategy[];
  protected abstract verifyAppleToken(token: string): Promise<IAppleProviderOutput>;
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { TokenService } from 'src/libs/tokens/services';
import { IGoogleProviderOutput, IExtractionStrategy } from 'src/libs/tokens/common/interfaces';

/**
 * Abstract base class for Google Sign-In authentication guards.
 *
 * @description
 * Implements the Template Method pattern for Google identity token validation. Subclasses customize
 * token extraction strategies and verification logic while inheriting the core authentication flow.
 *
 * This guard is specifically designed for Google's mobile authentication flow (Google Sign-In for Mobile),
 * where the client receives an identity token (ID token) from Google's authentication service.
 *
 * ## Authentication Flow
 *
 * 1. **Extract Token** - Retrieves Google ID token from request (header, body, or query param)
 * 2. **Verify Token** - Validates token with Google's public keys (JWKS), checks signature, issuer, audience, and expiration
 * 3. **Attach Google Data** - Stores decoded Google user information in `request.idToken`
 * 4. **Grant Access** - Returns `true` to allow request to proceed
 *
 * ## Template Method Pattern
 *
 * Fixed algorithm (`canActivate`) with customizable steps:
 * - {@link getExtractionStrategies} - Where to find the token (header, body, query param, etc.)
 * - {@link verifyGoogleToken} - How to validate and decode the Google identity token
 *
 * ## Request Mutation
 *
 * On successful authentication, attaches Google user data to request:
 * ```typescript
 * request.idToken = {
 *   email: "user@gmail.com",              // User's email address
 *   isVerifiedEmail: true,                // Email verification status from Google
 *   hostedDomain: "company.com",          // G Suite domain (optional, only for G Suite accounts)
 *   name: "John Doe",                     // Full name (optional)
 *   givenName: "John",                    // First name (optional)
 *   familyName: "Doe",                    // Last name (optional)
 *   picture: "https://lh3.google...",     // Profile picture URL (optional)
 *   locale: "en"                          // User's locale/language preference (optional)
 * }
 * ```
 *
 * ## Error Handling
 *
 * Throws {@link UnauthorizedException} (HTTP 401) when:
 * - Token not found in request
 * - Token signature invalid (doesn't match Google's public keys)
 * - Token issuer is not `https://accounts.google.com` or `accounts.google.com`
 * - Token audience doesn't match configured OAuth 2.0 client ID
 * - Token expired or used before valid time (max age: 5 minutes)
 * - Token verification fails for any reason
 *
 * ## Google Token Validation
 *
 * The guard verifies Google identity tokens against Google's specifications:
 * - **Issuer**: Must be `https://accounts.google.com` or `accounts.google.com`
 * - **Audience**: Must match your OAuth 2.0 client ID (e.g., `472416144947-...apps.googleusercontent.com`)
 * - **Signature**: Validated using Google's public keys from `https://www.googleapis.com/oauth2/v3/certs`
 * - **Expiration**: Token must be recent (max age: 5 minutes) to prevent replay attacks
 * - **Claims**: Extracts user profile information including email, name, picture, and G Suite domain
 *
 * ## G Suite (Google Workspace) Support
 *
 * For G Suite/Google Workspace accounts, the `hostedDomain` field (`hd` claim) contains the organization's
 * domain. This can be used to restrict access to specific organizations:
 * ```typescript
 * if (request.idToken.hostedDomain !== 'mycompany.com') {
 *   throw new UnauthorizedException('Only company accounts allowed');
 * }
 * ```
 *
 * @see {@link https://developers.google.com/identity/sign-in/web/backend-auth Google Sign-In Backend Auth}
 * @see {@link https://developers.google.com/identity/protocols/oauth2/openid-connect#obtainuserinfo OpenID Connect}
 * @see {@link https://developers.google.com/identity/gsi/web/reference/js-reference Google Identity Services}
 *
 */

@Injectable()
export abstract class AbstractGoogleMobileTokenGuard implements CanActivate {
  constructor(protected readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest & { idToken?: IGoogleProviderOutput }>();

    const token = this.tokenService.extract(request, this.getExtractionStrategies());

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tokenData = await this.verifyGoogleToken(token);

    if (!tokenData) {
      throw new UnauthorizedException('Invalid token');
    }

    request.idToken = tokenData;

    return true;
  }

  protected abstract getExtractionStrategies(): IExtractionStrategy[];
  protected abstract verifyGoogleToken(token: string): Promise<IGoogleProviderOutput>;
}

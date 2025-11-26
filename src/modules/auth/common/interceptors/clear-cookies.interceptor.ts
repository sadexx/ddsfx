import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { Observable, tap } from 'rxjs';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';
import { ETokenName } from 'src/libs/tokens/common/enums';

/**
 * Factory function that creates an interceptor to clear authentication cookies from client browsers.
 *
 * @description
 * This interceptor is used during state transitions where old authentication tokens must be invalidated
 * (e.g., logout, session upgrade from registration to authenticated user). It sends `Set-Cookie` headers
 * with expired dates to instruct browsers to delete the specified cookies.
 *
 * ## Execution Context
 * - **When:** Executes in the RxJS pipeline AFTER the route handler returns successfully
 * - **Trigger:** Only runs if handler doesn't throw (uses `tap()` operator)
 * - **Phase:** Response transformation (cookies cleared before client receives response)
 *
 * ## Security Considerations
 * - Cookie attributes (httpOnly, secure, sameSite, path) MUST match those used when setting cookies
 * - Mismatch in attributes will cause browser to treat clear operation as different cookie
 * - Always clears cookies on successful response only (errors preserve session state)
 *
 * ## Cookie Matching Rules (RFC 6265)
 * Browser identifies cookies by tuple: (name, domain, path, secure, httpOnly)
 * - If any attribute differs between SET and CLEAR → cookie NOT cleared
 * - `secure: true` cookies cannot be cleared over HTTP (browser security policy)
 *
 * @param tokensToClear - Array of cookie names to clear. Defaults to all authentication tokens
 *                        defined in {@link ETokenName} enum.
 *
 * @returns NestJS interceptor class that clears specified cookies after successful handler execution
 *
 * @example
 * // Clear only registration token when user completes registration
 * ```typescript
 * ＠Post('finish-registration')
 * ＠UseInterceptors(
 *   ClearCookiesInterceptor([ETokenName.REGISTRATION_TOKEN]),
 *   SetCookiesInterceptor  // Sets access + refresh tokens
 * )
 * async finishRegistration() {
 *   // Handler logic
 * }
 * ```
 *
 * @example
 * // Clear all authentication cookies on logout
 * ```typescript
 * ＠Post('logout')
 * ＠UseInterceptors(ClearCookiesInterceptor())  // No args = clear all
 * async logout() {
 *   // Cleanup logic (invalidate DB sessions, etc.)
 * }
 * ```
 *
 * @see {@link SetCookiesInterceptor} - Counterpart for setting cookies
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie} - MDN Set-Cookie documentation
 *
 * @throws Never throws - side effects only (cookie clearing)
 *
 * @remarks
 * - Interceptor uses RxJS `tap()` operator (doesn't transform response data)
 * - Cookie attributes sourced from environment config to ensure consistency
 * - In development (COOKIE_SECURE_MODE=false): cookies cleared over HTTP
 * - In production (COOKIE_SECURE_MODE=true): requires HTTPS, uses sameSite=none for CORS
 */
export const ClearCookiesInterceptor = (
  tokensToClear: ETokenName[] = Object.values(ETokenName),
): Type<NestInterceptor> => {
  @Injectable()
  class ClearCookiesInterceptor implements NestInterceptor {
    private readonly COOKIE_SECURE_MODE: boolean;

    constructor(private readonly configService: ConfigService) {
      const { COOKIE_SECURE_MODE } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
      this.COOKIE_SECURE_MODE = COOKIE_SECURE_MODE;
    }

    /**
     * Intercepts response to clear specified authentication cookies.
     *
     * @description
     * Clears cookies by setting them to empty string with expiration date in the past (epoch 0).
     * Browser interprets this as instruction to delete the cookie from its storage.
     *
     * @param context - NestJS execution context (provides access to HTTP request/response)
     * @param next - Next handler in interceptor chain
     *
     * @returns Observable that emits after cookies are cleared (on successful handler completion)
     *
     * @internal
     * Implementation uses RxJS `tap()` for side effects without modifying response data.
     * Cookies cleared in `next` callback (only if Observable emits successfully).
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
      const response = context.switchToHttp().getResponse<FastifyReply>();
      const isCookieSecureModeEnabled = this.COOKIE_SECURE_MODE;

      return next.handle().pipe(
        tap({
          next: () => {
            for (const token of tokensToClear) {
              response.setCookie(token, '', {
                httpOnly: true,
                secure: isCookieSecureModeEnabled,
                sameSite: isCookieSecureModeEnabled ? 'none' : 'lax',
                expires: new Date(0),
                path: '/',
              });
            }
          },
        }),
      );
    }
  }

  return ClearCookiesInterceptor;
};

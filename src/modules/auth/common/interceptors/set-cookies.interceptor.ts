import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ETokenName } from 'src/libs/tokens/common/enums';
import { EUserRoleName } from 'src/modules/users/common/enum';
import { IRegistrationStepsOutput } from 'src/modules/auth/common/outputs';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

export interface ICookieData {
  accessToken?: string;
  refreshToken?: string;
  registrationToken?: string;
  otpVerificationToken?: string;
  sessionId?: string;
  availableRoles?: EUserRoleName[];
  registrationSteps?: IRegistrationStepsOutput[];
}

/**
 * NestJS interceptor that automatically sets authentication cookies based on handler return data.
 *
 * @description
 * This interceptor transforms handler responses by:
 * 1. Extracting token values from response data
 * 2. Setting corresponding HTTP-only cookies with security attributes
 * 3. Returning modified response body (tokens remain in body for backward compatibility)
 *
 * ## Architecture Pattern
 * - **Input:** Handler returns {@link ICookieData} object with optional token properties
 * - **Side Effect:** Sets cookies via `Set-Cookie` headers (tokens attached to response)
 * - **Output:** Original data passed through (tokens in both cookies AND response body)
 *
 * ## Security Model
 * - Cookies set as `httpOnly: true` to prevent XSS token theft
 * - Environment-aware `secure` flag (HTTPS-only in production)
 * - CSRF protection via `sameSite` attribute (strict in dev, none in prod for CORS)
 *
 * ## Token Lifecycles
 * - **Access Token (JWT):** Short-lived (15m), used for API authorization
 * - **Refresh Token (Opaque):** Long-lived (7d), used to obtain new access tokens
 * - **Registration Token (Opaque):** Ephemeral (1h), multi-step registration flow state
 * - **Role Selection Token (Opaque):** Ephemeral (1h), post-OAuth role selection state
 *
 * @example
 * // Basic usage - single token
 * ```typescript
 * ＠Post('login')
 * ＠UseInterceptors(SetCookiesInterceptor)
 * async login(＠Body() dto: LoginDto): Promise<ICookieData> {
 *   const tokens = await this.authService.login(dto);
 *   return {
 *     accessToken: tokens.access,   // → Cookie set automatically
 *     refreshToken: tokens.refresh  // → Cookie set automatically
 *   };
 * }
 * ```
 *
 * @example
 * // State transition - clear old token, set new tokens
 * ```typescript
 * ＠Post('finish-registration')
 * ＠UseInterceptors(
 *   ClearCookiesInterceptor([ETokenName.REGISTRATION_TOKEN]),  // Clear first
 *   SetCookiesInterceptor                                       // Then set new
 * )
 * async finishRegistration(): Promise<ICookieData> {
 *   return {
 *     accessToken: "...",   // New session tokens
 *     refreshToken: "..."
 *     sessionId: "..."
 *   };
 * }
 * ```
 *
 * @example
 * // Multi-step flow - registration token only
 * ```typescript
 * ＠Post('start-registration')
 * ＠UseInterceptors(SetCookiesInterceptor)
 * async startRegistration(): Promise<ICookieData> {
 *   return {
 *     registrationToken: "reg.v1.abc...",  // Temporary state token
 *     registrationSteps: [...]              // Progress metadata (body only)
 *   };
 * }
 * ```
 *
 * @see {@link ClearCookiesInterceptor} - Counterpart for clearing cookies
 * @see {@link ICookieData} - Expected return type from handlers
 *
 * @throws Never throws - gracefully handles undefined/null token values
 *
 * @remarks
 * - Uses RxJS `map()` operator (transforms response while preserving Observable stream)
 * - Token expiration times loaded from environment config at interceptor instantiation
 * - Cookie attributes consistent with ClearCookiesInterceptor (required for proper clearing)
 * - Response body intentionally includes tokens (for clients that can't access cookies)
 *
 * @security
 * **Known Issue:** Tokens returned in both cookies AND response body creates XSS attack surface.
 * - Cookies are httpOnly (safe from JavaScript)
 * - Response body tokens accessible via JavaScript (vulnerable to XSS)
 * - **Recommendation:** Remove tokens from response body in future version (breaking change)
 */
@Injectable()
export class SetCookiesInterceptor implements NestInterceptor {
  private readonly COOKIE_SECURE_MODE: boolean;
  private readonly JWT_ACCESS_TOKEN_EXPIRATION_TIME: number;
  private readonly OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME: number;
  private readonly OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME: number;
  private readonly OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME: number;

  constructor(private readonly configService: ConfigService) {
    const {
      COOKIE_SECURE_MODE,
      JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME,
      OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME,
      OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME,
    } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

    this.COOKIE_SECURE_MODE = COOKIE_SECURE_MODE;
    this.JWT_ACCESS_TOKEN_EXPIRATION_TIME = JWT_ACCESS_TOKEN_EXPIRATION_TIME;
    this.OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME = OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME;
    this.OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME = OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME;
    this.OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME = OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME;
  }

  /**
   * Intercepts handler response to automatically set authentication cookies.
   *
   * @description
   * Conditionally sets cookies based on which token properties exist in handler return data.
   * Each token type has dedicated cookie with specific expiration time and security attributes.
   *
   * @param context - NestJS execution context (provides HTTP request/response objects)
   * @param next - Next handler in interceptor chain (returns Observable with handler result)
   *
   * @returns Observable that emits transformed response data (tokens in body + cookies set)
   *
   * @internal
   * Implementation checks each token property existence (`data?.accessToken`) before setting cookie.
   * Undefined/null values are skipped (no cookie set, no error thrown).
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: ICookieData) => {
        const reply = context.switchToHttp().getResponse<FastifyReply>();
        const isCookieSecureModeEnabled = this.COOKIE_SECURE_MODE;

        if (data?.accessToken) {
          reply.setCookie(ETokenName.ACCESS_TOKEN, data.accessToken, {
            httpOnly: true,
            secure: isCookieSecureModeEnabled,
            sameSite: isCookieSecureModeEnabled ? 'none' : 'lax',
            maxAge: this.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            path: '/',
          });
        }

        if (data?.refreshToken) {
          reply.setCookie(ETokenName.REFRESH_TOKEN, data.refreshToken, {
            httpOnly: true,
            secure: isCookieSecureModeEnabled,
            sameSite: isCookieSecureModeEnabled ? 'none' : 'lax',
            maxAge: this.OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME,
            path: '/',
          });
        }

        if (data?.registrationToken) {
          reply.setCookie(ETokenName.REGISTRATION_TOKEN, data.registrationToken, {
            httpOnly: true,
            secure: isCookieSecureModeEnabled,
            sameSite: isCookieSecureModeEnabled ? 'none' : 'lax',
            maxAge: this.OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME,
            path: '/',
          });
        }

        if (data?.otpVerificationToken) {
          reply.setCookie(ETokenName.OTP_VERIFICATION_TOKEN, data.otpVerificationToken, {
            httpOnly: true,
            secure: isCookieSecureModeEnabled,
            sameSite: isCookieSecureModeEnabled ? 'none' : 'lax',
            maxAge: this.OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME,
            path: '/',
          });
        }

        return {
          accessToken: data?.accessToken,
          refreshToken: data?.refreshToken,
          registrationToken: data?.registrationToken,
          otpVerificationToken: data?.otpVerificationToken,
          sessionId: data?.sessionId,
          availableRoles: data?.availableRoles,
          registrationSteps: data?.registrationSteps,
        };
      }),
    );
  }
}

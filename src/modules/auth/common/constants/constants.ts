import { ERegistrationStrategy } from 'src/modules/auth/common/enums';

export const OAUTH_REGISTRATION_STRATEGIES: readonly ERegistrationStrategy[] = [
  ERegistrationStrategy.GOOGLE,
  ERegistrationStrategy.APPLE,
  ERegistrationStrategy.FACEBOOK,
] as const;

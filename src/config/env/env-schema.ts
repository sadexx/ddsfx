import { EEnvironment } from 'src/common/enums';
import { transforms, validatorFactories, validators } from 'src/common/utils';
import { EnvConfig, RawEnvConfig, TConfigRules } from 'src/config/common/types';

const validationRules: TConfigRules<EnvConfig> = {
  APP_PORT: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  APP_URL: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  INTERNAL_API_KEY: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  INTERNAL_API_SECRET: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  DEFAULT_USER_AGENT: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  NODE_ENV: {
    required: true,
    validate: validatorFactories.oneOf(Object.values(EEnvironment), 'NODE_ENV'),
    transform: transforms.enum<EEnvironment>,
  },
  FIRST_LAUNCH: {
    required: true,
    validate: validators.boolean,
    transform: transforms.boolean,
  },
  SEND_LOG_TO_LOKI: {
    required: true,
    validate: validators.boolean,
    transform: transforms.boolean,
  },
  COOKIE_SECURE_MODE: {
    required: true,
    validate: validators.boolean,
    transform: transforms.boolean,
  },
  JWT_ACCESS_TOKEN_SECRET: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  OPAQUE_REFRESH_TOKEN_SECRET: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  OPAQUE_REGISTRATION_TOKEN_SECRET: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  OPAQUE_OTP_VERIFICATION_TOKEN_SECRET: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  BCRYPT_SALT_ROUNDS: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  POSTGRES_HOST: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  POSTGRES_PORT: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  POSTGRES_USER: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  POSTGRES_DB: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  POSTGRES_PASSWORD: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  POSTGRES_EXTERNAL_DB_URL: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  REDIS_HOST: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  REDIS_PORT: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  REDIS_TTL_MINUTES: {
    required: true,
    validate: validators.numericString,
    transform: transforms.number,
  },
  OPENSEARCH_HOST: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  OPENSEARCH_USERNAME: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  OPENSEARCH_PASSWORD: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  AWS_ACCOUNT_ID: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  AWS_REGION: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  AWS_ACCESS_KEY_ID: {
    required: false,
    validate: validators.optionalString,
    transform: transforms.string,
  },
  AWS_SECRET_ACCESS_KEY: {
    required: false,
    validate: validators.optionalString,
    transform: transforms.string,
  },
  APPLE_CLIENT_ID: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
  GOOGLE_OAUTH2_CLIENT_ID: {
    required: true,
    validate: validators.requiredString,
    transform: transforms.string,
  },
};

export function validateAndTransformEnv(rawEnv: RawEnvConfig): EnvConfig {
  const errors: string[] = [];
  const result: Record<string, string | number | boolean> = {};

  for (const [key, rule] of Object.entries(validationRules)) {
    const envKey = key as keyof EnvConfig;
    const value = rawEnv[envKey];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`Missing required environment variable: ${envKey}`);
      continue;
    }

    try {
      rule.validate(value as string, envKey);
      result[envKey] = rule.transform(value as string);
    } catch (error) {
      errors.push(`Validation error for ${envKey}: ${(error as Error).message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return result as EnvConfig;
}

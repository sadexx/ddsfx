export type EnvConfig = Readonly<{
  APP_PORT: number;
  APP_URL: string;
  INTERNAL_API_KEY: string;
  INTERNAL_API_SECRET: string;
  DEFAULT_USER_AGENT: string;
  NODE_ENV: string;
  FIRST_LAUNCH: boolean;
  SEND_LOG_TO_LOKI: boolean;
  COOKIE_SECURE_MODE: boolean;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: number;
  OPAQUE_REFRESH_TOKEN_SECRET: string;
  OPAQUE_REFRESH_TOKEN_EXPIRATION_TIME: number;
  OPAQUE_REGISTRATION_TOKEN_SECRET: string;
  OPAQUE_REGISTRATION_TOKEN_EXPIRATION_TIME: number;
  OPAQUE_OTP_VERIFICATION_TOKEN_SECRET: string;
  OPAQUE_OTP_VERIFICATION_TOKEN_EXPIRATION_TIME: number;
  BCRYPT_SALT_ROUNDS: number;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_DB: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_EXTERNAL_DB_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_TTL_MINUTES: number;
  OPENSEARCH_HOST: string;
  OPENSEARCH_USERNAME: string;
  OPENSEARCH_PASSWORD: string;
  AWS_ACCOUNT_ID: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_BUCKET_NAME: string;
  AWS_CLOUDFRONT_DISTRIBUTION_ID: string;
  AWS_CLOUDFRONT_DOMAIN_NAME: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_AUTHOR: string;
  EMAIL_AUTHOR_NAME: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  APPLE_CLIENT_ID: string;
  GOOGLE_OAUTH2_CLIENT_ID: string;
  MOCK_ENABLED: boolean;
  MOCK_EMAILS: string;
  MOCK_PHONES: string;
}>;

export type RawEnvConfig = {
  [K in keyof EnvConfig]: string | undefined;
};

export type TConfigRules<T extends Record<string, unknown> = EnvConfig> = {
  [K in keyof T]: {
    required: boolean;
    validate: (value: string, fieldName: string) => void;
    transform: (value: string) => T[K];
  };
};

export type TValidators = Record<string, (value: string, fieldName: string) => void>;
export type TValidatorFactory = Record<string, (validValues: string[], fieldName: string) => (value: string) => void>;
export type TTransformations = Record<string, (value: string) => string | number | boolean>;

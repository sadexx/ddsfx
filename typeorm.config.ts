import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import * as fs from 'fs';
import { IS_PRODUCTION, NUMBER_OF_MILLISECONDS_IN_MINUTE } from 'src/common/constants';
import { loadEnv } from 'src/config/env';

const envVariables = loadEnv();
const typeOrmModuleOptions: TypeOrmModuleOptions = {
  retryAttempts: 5,
  retryDelay: 5000,
  verboseRetryLog: true,
};

export const dataSourceOptions: DataSourceOptions = {
  host: envVariables.POSTGRES_HOST,
  port: envVariables.POSTGRES_PORT,
  database: envVariables.POSTGRES_DB,
  username: envVariables.POSTGRES_USER,
  password: envVariables.POSTGRES_PASSWORD,
  type: 'postgres',
  schema: 'public',
  useUTC: false,
  connectTimeoutMS: 0,
  poolSize: 20,
  uuidExtension: 'uuid-ossp',
  entities: [__dirname + '/src/**/{*.entity,enums}.{js,ts}'],
  migrations: [__dirname + '/src/database/migrations/*.{js,ts}'],
  logging: false,
  logger: 'simple-console',
  synchronize: true,
  migrationsRun: false,
  relationLoadStrategy: 'join',
  ssl: IS_PRODUCTION
    ? {
        rejectUnauthorized: true,
        ca: [fs.readFileSync(__dirname + '/../global-bundle.pem').toString()],
      }
    : false,
  cache: {
    type: 'ioredis',
    duration: envVariables.REDIS_TTL_MINUTES * NUMBER_OF_MILLISECONDS_IN_MINUTE,
    options: {
      host: envVariables.REDIS_HOST,
      port: envVariables.REDIS_PORT,
    },
  },
};

export const typeOrmConfig = {
  ...typeOrmModuleOptions,
  ...dataSourceOptions,
};

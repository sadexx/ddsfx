import { loadEnv } from 'src/config/env';
import { DataSource, DataSourceOptions } from 'typeorm';
import { dataSourceOptions } from 'typeorm.config';

const envVariables = loadEnv();

export const typeOrmMigrationsConfig = new DataSource({
  ...dataSourceOptions,
  port: envVariables.POSTGRES_PORT,
  host: 'localhost',
} as DataSourceOptions);

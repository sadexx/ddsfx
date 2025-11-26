import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/libs/redis/services';
import { REDIS_CLIENT_TOKEN } from 'src/libs/redis/common/constants';
import Redis from 'ioredis';
import { EnvConfig } from 'src/config/common/types';
import { redisConfig } from 'src/libs/redis/common/config';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT_TOKEN,
      useFactory: (configService: ConfigService): Redis => {
        const { REDIS_HOST, REDIS_PORT } = configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);

        return new Redis({
          ...redisConfig(),
          host: REDIS_HOST,
          port: REDIS_PORT,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}

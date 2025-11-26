import { CommonRedisOptions } from 'ioredis';
import { NUMBER_OF_MILLISECONDS_IN_FIVE_SECONDS } from 'src/common/constants';
import { REDIS_MAX_RETRIES } from 'src/libs/redis/common/constants';

export const redisConfig = (): CommonRedisOptions => {
  return {
    retryStrategy: (times: number): number | null => {
      if (times <= REDIS_MAX_RETRIES) {
        return NUMBER_OF_MILLISECONDS_IN_FIVE_SECONDS;
      }

      return null;
    },
    keepAlive: 12,
    noDelay: true,
    connectionName: 'freya-connection',
    db: 0,
    autoResubscribe: true,
    autoResendUnfulfilledCommands: true,
    reconnectOnError: null,
    readOnly: false,
    stringNumbers: false,
    connectTimeout: 1000,
    monitor: false,
    maxRetriesPerRequest: 20,
    maxLoadingRetryTime: 1000,
    enableAutoPipelining: false,
    autoPipeliningIgnoredCommands: [],
    enableOfflineQueue: true,
    enableReadyCheck: true,
    lazyConnect: false,
    scripts: undefined,
  };
};

/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NUMBER_OF_SECONDS_IN_MINUTE } from 'src/common/constants';
import { REDIS_CLIENT_TOKEN } from 'src/libs/redis/common/constants';
import Redis from 'ioredis';
import { EnvConfig } from 'src/config/common/types';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';

@Injectable()
export class RedisService {
  private readonly DEFAULT_TTL_SECONDS: number;

  public constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    const { REDIS_TTL_MINUTES } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.DEFAULT_TTL_SECONDS = REDIS_TTL_MINUTES * NUMBER_OF_SECONDS_IN_MINUTE;
  }

  /**
   * Gets a value from Redis by key.
   * @param key The key to retrieve from Redis.
   * @returns The value associated with the given key, or null if the key does not exist.
   */
  public async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * Sets a key in the Redis database to the given value.
   * @param key The key to set.
   * @param value The value to set the key to.
   * @param ttlSeconds The number of seconds to live before the key is automatically deleted.
   * If not provided, the default ttl is used.
   */
  public async set(key: string, value: string | number, ttlSeconds?: number): Promise<void> {
    await this.setWithTtl(key, String(value), ttlSeconds);
  }

  /**
   * Retrieves a JSON-parsed value from the Redis database for the given key.
   * @param key The key whose value to retrieve.
   * @returns The parsed JSON value of the key, or null if the key does not exist.
   */
  public async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.redisClient.get(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  }

  /**
   * Sets a key in the Redis database to the JSON string representation of the given value.
   * @param key The key to set.
   * @param value The value to set the key to.
   * @param ttlSeconds The number of seconds to live before the key is automatically deleted.
   * If not provided, the default ttl is used.
   */
  public async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.setWithTtl(key, JSON.stringify(value), ttlSeconds);
  }

  /**
   * Updates a JSON value in Redis without modifying its TTL.
   * @param key The key to update.
   * @param value The new value to set.
   * If the key does not exist `-2`, the method does nothing.
   * If the key exists but has no expiration `-1`, the value is updated without setting a TTL.
   */
  public async updateJson<T>(key: string, value: T): Promise<void> {
    const ttl = await this.redisClient.ttl(key);

    if (ttl === -2) {
      return;
    }

    if (ttl === -1) {
      await this.redisClient.set(key, JSON.stringify(value));
    } else {
      await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    }
  }

  /**
   * Deletes a key from the Redis database.
   * @param key The key to delete.
   */
  public async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * Retrieves all keys matching the given pattern.
   * @param pattern The glob pattern to match.
   * @returns A list of matching keys.
   */
  public async keys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }

  /**
   * Deletes all keys matching the given pattern.
   * @param pattern The glob pattern to match.
   */
  public async delManyByPattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);

    if (keys && keys.length > 0) {
      await this.redisClient.del(...keys);
    }
  }

  /**
   * Increment the number stored at `key` by 1.
   * If the key does not exist, it will be created and set to 0 before performing the increment operation.
   * @param key The key to increment.
   * @returns The new value of the key after the increment.
   */

  public async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  /**
   * Decrement the number stored at `key` by 1.
   * If the key does not exist, the value will be initialized to 0 before the decrement operation.
   * @param key The key to decrement.
   * @returns The new value of the key after the decrement.
   */
  public async decr(key: string): Promise<number> {
    return await this.redisClient.decr(key);
  }

  /**
   * Sets a key in the Redis database to the given value with an optional TTL.
   * @param key The key to set.
   * @param value The value to set the key to.
   * @param ttlSeconds The number of seconds to live before the key is automatically deleted.
   * If not provided, the default ttl is used.
   */
  private async setWithTtl(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.DEFAULT_TTL_SECONDS;

    if (ttl > 0) {
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      await this.redisClient.set(key, value);
    }
  }
}

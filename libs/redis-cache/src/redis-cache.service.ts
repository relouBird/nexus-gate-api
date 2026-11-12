import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ServiceConfiguration } from '@nexus/configuration';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configuration: ServiceConfiguration) {
    this.client = new Redis({
      port: this.configuration.getSharedNumber('REDIS_PORT', 6379),
      host: this.configuration.getShared('REDIS_HOST', 'localhost'),
      password: this.configuration.getShared('REDIS_PASSWORD'),
      db: 0,
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds !== undefined) {
      if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds <= 0) {
        throw new RangeError('Redis TTL must be a positive integer');
      }
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async upsert(key: string, value: string): Promise<void> {
    await this.client.set(key, value, 'KEEPTTL');
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}

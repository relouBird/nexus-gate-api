// redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ServiceConfiguration } from '@nexus/configuration';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private configuration: ServiceConfiguration) {
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
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}

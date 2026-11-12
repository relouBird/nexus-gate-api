// infrastructure/RedisService.ts
import Redis, { type RedisOptions } from 'ioredis';

export class RedisUnavailableError extends Error {
  public cause: unknown;
  constructor(cause: unknown) {
    super('Redis unavailable');
    this.cause = cause;
  }
}

export class RedisService {
  private client: Redis;
  private connected = false;

  constructor(options: RedisOptions = {}) {
    const port = Number(process.env.SHARED_REDIS_PORT ?? 6379);
    const host = process.env.SHARED_REDIS_HOST || 'localhost';
    const password = process.env.SHARED_REDIS_PASSWORD || undefined;
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('SHARED_REDIS_PORT must be a valid TCP port');
    }
    console.log('[Redis] initializing with options:', {
      port,
      host,
      ...options,
    });
    this.client = new Redis({
      port,
      host,
      password,
      db: 0,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 200, 2000), // backoff progressif, plafonné à 2s
      lazyConnect: true, // on contrôle nous-mêmes le moment de connexion
      ...options,
    });

    this.client.on('connect', () => {
      this.connected = true;
      console.log('[Redis] connected');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      console.error('[Redis] error:', err.message);
    });

    this.client.on('close', () => {
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    await this.client.connect();
  }

  isConnected(): boolean {
    return this.connected;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      console.error(`[Redis] GET failed for "${key}":`, (err as Error).message);

      throw new RedisUnavailableError(err); // on ne masque plus l'erreur en null
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      console.error(`[Redis] SET failed for "${key}":`, (err as Error).message);
    }
  }

  async setKeepTtl(key: string, value: string): Promise<void> {
    try {
      await this.client.set(key, value, 'KEEPTTL');
    } catch (err) {
      console.error(
        `[Redis] SET KEEPTTL failed for "${key}":`,
        (err as Error).message,
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error(`[Redis] DEL failed for "${key}":`, (err as Error).message);
    }
  }

  async incr(key: string): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (err) {
      console.error(
        `[Redis] INCR failed for "${key}":`,
        (err as Error).message,
      );
      throw new RedisUnavailableError(err); // on ne masque plus l'erreur en null
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.expire(key, ttlSeconds);
    } catch (err) {
      console.error(
        `[Redis] EXPIRE failed for "${key}":`,
        (err as Error).message,
      );
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

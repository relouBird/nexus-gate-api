import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import { ServiceConfiguration } from '@nexus/configuration';
import { RedisCacheService } from './redis-cache.service';

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(() => mockRedisClient),
}));

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  const configuration = {
    getShared: jest.fn((key: string, defaultValue?: string) =>
      key === 'REDIS_HOST' ? 'redis.internal' : defaultValue,
    ),
    getSharedNumber: jest.fn(() => 6380),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        { provide: ServiceConfiguration, useValue: configuration },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
  });

  it('creates a Redis client from shared configuration', () => {
    expect(Redis).toHaveBeenCalledWith({
      port: 6380,
      host: 'redis.internal',
      password: undefined,
      db: 0,
    });
    expect(configuration.getSharedNumber).toHaveBeenCalledWith(
      'REDIS_PORT',
      6379,
    );
    expect(configuration.getShared).toHaveBeenCalledWith(
      'REDIS_HOST',
      'localhost',
    );
    expect(configuration.getShared).toHaveBeenCalledWith('REDIS_PASSWORD');
  });

  it('gets and deletes cache entries', async () => {
    mockRedisClient.get.mockResolvedValue('cached value');

    await expect(service.get('cache:key')).resolves.toBe('cached value');
    await service.del('cache:key');

    expect(mockRedisClient.get).toHaveBeenCalledWith('cache:key');
    expect(mockRedisClient.del).toHaveBeenCalledWith('cache:key');
  });

  it('sets values with or without a TTL', async () => {
    await service.set('cache:permanent', 'value');
    await service.set('cache:temporary', 'value', 60);

    expect(mockRedisClient.set).toHaveBeenNthCalledWith(
      1,
      'cache:permanent',
      'value',
    );
    expect(mockRedisClient.set).toHaveBeenNthCalledWith(
      2,
      'cache:temporary',
      'value',
      'EX',
      60,
    );
  });

  it('rejects invalid TTL values', async () => {
    await expect(service.set('cache:key', 'value', 0)).rejects.toThrow(
      'Redis TTL must be a positive integer',
    );
    await expect(service.set('cache:key', 'value', 1.5)).rejects.toThrow(
      'Redis TTL must be a positive integer',
    );
  });

  it('updates values while keeping their existing TTL', async () => {
    await service.upsert('cache:key', 'new value');

    expect(mockRedisClient.set).toHaveBeenCalledWith(
      'cache:key',
      'new value',
      'KEEPTTL',
    );
  });

  it('disconnects Redis when the module is destroyed', () => {
    service.onModuleDestroy();

    expect(mockRedisClient.disconnect).toHaveBeenCalledTimes(1);
  });
});

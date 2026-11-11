import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceConfiguration } from './configuration.service';

describe('ServiceConfiguration', () => {
  let configuration: ServiceConfiguration;

  beforeEach(async () => {
    const configService = new ConfigService({
      AUTH_SERVICE_DATABASE_HOST: 'auth-db',
      USER_SERVICE_DATABASE_HOST: 'user-db',
      SHARED_REDIS_PORT: '6379',
    });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ServiceConfiguration,
          useValue: new ServiceConfiguration('auth-service', configService),
        },
      ],
    }).compile();

    configuration = module.get<ServiceConfiguration>(ServiceConfiguration);
  });

  it('reads only values in its application namespace', () => {
    expect(configuration.get('DATABASE_HOST')).toBe('auth-db');
    expect(configuration.get('USER_SERVICE_DATABASE_HOST')).toBeUndefined();
  });

  it('reads explicitly shared configuration', () => {
    expect(configuration.getSharedNumber('REDIS_PORT')).toBe(6379);
  });

  it('fails with the missing key name when a required value is absent', () => {
    expect(() => configuration.getOrThrow('DATABASE_URL')).toThrow(
      'AUTH_SERVICE_DATABASE_URL',
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ServiceConfiguration } from '@nexus/configuration';

describe('DatabaseService', () => {
  let service: DatabaseService;
  const configuration = {
    getSharedOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        DATABASE_HOST: 'localhost',
        DATABASE_USER: 'root',
        DATABASE_NAME: 'nexus_test',
      };
      return values[key];
    }),
    getShared: jest.fn(() => ''),
    getSharedNumber: jest.fn(() => 3306),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: ServiceConfiguration, useValue: configuration },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

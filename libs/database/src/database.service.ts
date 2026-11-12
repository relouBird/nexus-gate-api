import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from './generated/prisma-client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ServiceConfiguration } from '@nexus/configuration';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configuration: ServiceConfiguration) {
    const adapter = new PrismaMariaDb({
      host: configuration.getSharedOrThrow('DATABASE_HOST'),
      port: configuration.getSharedNumber('DATABASE_PORT', 3306),
      user: configuration.getSharedOrThrow('DATABASE_USER'),
      password: configuration.getShared('DATABASE_PASSWORD', '') ?? '',
      database: configuration.getSharedOrThrow('DATABASE_NAME'),
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma-client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { ServiceConfiguration } from '@nexus/configuration';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configuration: ServiceConfiguration) {
    const adapter = new PrismaMariaDb({
      host: configuration.getOrThrow('DATABASE_HOST'),
      port: configuration.getNumber('DATABASE_PORT', 3306),
      user: configuration.getOrThrow('DATABASE_USER'),
      password: configuration.get('DATABASE_PASSWORD', '') ?? '',
      database: configuration.getOrThrow('DATABASE_NAME'),
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

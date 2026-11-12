// infrastructure/DatabaseService.ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@nexus/database/prisma-client'; // selon ton chemin généré

export class PrismaService extends PrismaClient {
  constructor() {
    const host = requiredEnvironment('FORWARDING_SERVICE_DATABASE_HOST');
    const user = requiredEnvironment('FORWARDING_SERVICE_DATABASE_USER');
    const password = requiredEnvironment('FORWARDING_SERVICE_DATABASE_PASSWORD');
    const database = requiredEnvironment('FORWARDING_SERVICE_DATABASE_NAME');
    const port = Number(
      process.env.FORWARDING_SERVICE_DATABASE_PORT ?? 3306,
    );
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(
        'FORWARDING_SERVICE_DATABASE_PORT must be a valid TCP port',
      );
    }

    console.log('[Database] initializing with options:', {
      host,
      user,
      password: '****',
      database,
    });

    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 5,
    });
    super({ adapter });
  }

  async connect(): Promise<void> {
    await super.$connect();
    console.log('[Database] connected');
  }

  async disconnect(): Promise<void> {
    await super.$disconnect();
  }
}

function requiredEnvironment(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing configuration: ${key}`);
  }
  return value;
}

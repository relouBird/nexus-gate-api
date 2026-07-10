// infrastructure/DatabaseService.ts
import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@nexus/database/prisma-client'; // selon ton chemin généré

export class PrismaService extends PrismaClient {
  constructor() {
    const host = process.env.DATABASE_HOST || 'localhost';
    const user = process.env.DATABASE_USER || 'root';
    const password = process.env.DATABASE_PASSWORD || '';
    const database = process.env.DATABASE_NAME || 'mydb';

    console.log('[Database] initializing with options:', {
      host,
      user,
      password: password ? '****' : '(empty)',
      database,
    });

    const adapter = new PrismaMariaDb({
      host,
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

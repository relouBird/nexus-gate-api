import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { AuthServiceModule } from './app.module';
import { printRpcPatterns } from './app.helper';

// Chargement des variables d'environnement du service.
dotenv.config({
  path: path.resolve(__dirname, '../../auth-service/.env'),
  override: true,
});

async function bootstrap() {
  const port = Number(process.env.PORT ?? 5552);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port,
      },
    },
  );

  // Validation globale des payloads RPC.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();

  printRpcPatterns();

  console.log(`🚀 Auth Service RPC listening on tcp://localhost:${port}`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { UserServiceModule } from './app.module';
import { printRpcPatterns } from './app.helper';

// Chargement des variables d'environnement du service.
dotenv.config({
  path: path.resolve(__dirname, '../../user-service/.env'),
  override: true,
});

async function bootstrap() {
  const port = Number(process.env.PORT ?? 5552);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port,
      },
    },
  );

  const loggerInstance = new Logger('AppService');

  // Validation globale des payloads RPC.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const message = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        );
        loggerInstance.error(message);
        return new RpcException({
          statusCode: 400,
          message,
        });
      },
    }),
  );

  await app.listen();

  printRpcPatterns();

  console.log(`🚀 User Service RPC listening on tcp://localhost:${port}`);
}

bootstrap();

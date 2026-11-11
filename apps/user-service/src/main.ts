import { NestFactory } from '@nestjs/core';
import {
  MicroserviceOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  loadGlobalEnvironment,
  readServiceEnvironment,
  readServiceEnvironmentNumber,
} from '@nexus/configuration';
import { UserServiceModule } from './app.module';
import { printRpcPatterns } from './app.helper';

loadGlobalEnvironment();

async function bootstrap() {
  const host = readServiceEnvironment('user-service', 'TCP_HOST', 'localhost');
  const port = readServiceEnvironmentNumber('user-service', 'TCP_PORT', 9004);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host,
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

  console.log(`🚀 User Service RPC listening on tcp://${host}:${port}`);
}

bootstrap();

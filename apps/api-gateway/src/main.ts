import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  loadGlobalEnvironment,
  readServiceEnvironmentNumber,
} from '@nexus/configuration';

async function bootstrap() {
  loadGlobalEnvironment();
  const port = readServiceEnvironmentNumber('api-gateway', 'HTTP_PORT', 9002);
  const app = await NestFactory.create(ApiGatewayModule);

  // Ajouter cette ligne pour préfixer toutes les routes avec /api
  app.setGlobalPrefix('api');

  // script pour contourner la securite CORS et communiquer avec une autre application sur un autre port
  app.enableCors({
    origin: ['http://localhost:9001', 'http://localhost:9000'], //
    credentials: true,
  });

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('NEXUS GATE - API GATEWAY')
    .setDescription('informations sur les services de mon API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Version 1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, documentFactory);

  await app.listen(port);
  console.log(`🚀 API GATEWAY IS RUNNING ON: http://localhost:${port}`);
}
bootstrap();

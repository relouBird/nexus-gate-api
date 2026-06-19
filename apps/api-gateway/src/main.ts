import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Charger .env du service
  dotenv.config({
    path: path.resolve(__dirname, '../../api-gateway/.env'),
    override: true,
  });

  const PORT = Number(process.env.port);

  // Ajouter cette ligne pour préfixer toutes les routes avec /api
  app.setGlobalPrefix('api');

  // script pour contourner la securite CORS et communiquer avec une autre application sur un autre port
  app.enableCors({
    origin: 'http://localhost:9001', //
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

  await app.listen(PORT ?? 9002);
  console.log(`🚀 API GATEWAY IS RUNNING ON: http://localhost:${PORT}`);
}
bootstrap();

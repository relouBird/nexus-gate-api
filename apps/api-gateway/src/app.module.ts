import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from './app.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api-gateway/.env',
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          imports: [ConfigModule],
          name: MICROSERVICES_CLIENTS.AUTH_SERVICE,
          useFactory: (config: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: Number(config.get('AUTH_SERVICE_PORT')) ?? 9003,
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class ApiGatewayModule {}

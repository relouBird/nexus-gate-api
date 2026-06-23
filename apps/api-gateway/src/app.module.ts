import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './app.middleware';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from './app.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { MeModule } from './me/me.module';

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
        {
          imports: [ConfigModule],
          name: MICROSERVICES_CLIENTS.USER_SERVICE,
          useFactory: (config: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              port: Number(config.get('USER_SERVICE_PORT')) ?? 9004,
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    AuthModule,
    TeamModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

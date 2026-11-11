import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './app.middleware';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from './app.constant';
import {
  ConfigurationModule as SharedConfigurationModule,
  ServiceConfiguration,
} from '@nexus/configuration';

// Les modules liés au fonctionnement de l'API Gateway
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { MeModule } from './me/me.module';
import { UserModule } from './user/user.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [
    HttpModule,
    SharedConfigurationModule.forRoot('api-gateway'),
    ClientsModule.registerAsync({
      clients: [
        {
          name: MICROSERVICES_CLIENTS.AUTH_SERVICE,
          useFactory: (config: ServiceConfiguration) => ({
            transport: Transport.TCP,
            options: {
              host: config.get('AUTH_SERVICE_HOST', 'localhost'),
              port: config.getNumber('AUTH_SERVICE_PORT', 9003),
            },
          }),
          inject: [ServiceConfiguration],
        },
        {
          name: MICROSERVICES_CLIENTS.USER_SERVICE,
          useFactory: (config: ServiceConfiguration) => ({
            transport: Transport.TCP,
            options: {
              host: config.get('USER_SERVICE_HOST', 'localhost'),
              port: config.getNumber('USER_SERVICE_PORT', 9004),
            },
          }),
          inject: [ServiceConfiguration],
        },
        {
          name: MICROSERVICES_CLIENTS.CONFIGURATION_SERVICE,
          useFactory: (config: ServiceConfiguration) => ({
            transport: Transport.TCP,
            options: {
              host: config.get('CONFIGURATION_SERVICE_HOST', 'localhost'),
              port: config.getNumber('CONFIGURATION_SERVICE_PORT', 9005),
            },
          }),
          inject: [ServiceConfiguration],
        },
      ],
    }),
    AuthModule,
    TeamModule,
    MeModule,
    UserModule,
    ConfigurationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

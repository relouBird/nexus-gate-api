import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './app.middleware';
import { HttpModule } from '@nestjs/axios';

// Librairies externes
import {
  ConfigurationModule as SharedConfigurationModule,
} from '@nexus/configuration';

// Importation des modules liés aux microservices
import { ClientsGatewayModule } from './clients-gateway/clients-gateway.module';

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
    AuthModule,
    TeamModule,
    MeModule,
    UserModule,
    ConfigurationModule,
    ClientsGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class ApiGatewayModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

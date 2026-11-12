import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@nexus/database';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { DatabaseService } from '@nexus/database';
import { RedisCacheModule } from '@nexus/redis-cache';
import { ServerModule } from './server/server.module';
import { RuleModule } from './rule/rule.module';
import { TokenModule } from './token/token.module';
import { RequestLogsModule } from './request-logs/request-logs.module';
import {
  ConfigurationModule,
  ServiceConfiguration,
} from '@nexus/configuration';

@Module({
  imports: [
    DatabaseModule,
    ConfigurationModule.forRoot('configuration-service'),
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ServiceConfiguration],
      useFactory: (config: ServiceConfiguration) => ({
        secret: config.getSharedOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    // Les modules métiers...
    ServerModule,
    RuleModule,
    TokenModule,
    RequestLogsModule,

    // Les utilitaires
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
  exports: [DatabaseService],
})
export class ConfigurationServiceModule {}

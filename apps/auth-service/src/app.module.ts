import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';

// Modules métiers
import { TeamModule } from './team/team.module';
import { OtpModule } from './otp/otp.module';
import { NotificationsModule } from './notifications/notifications.module';

// Librairies externes
import { DatabaseModule } from '@nexus/database';
import { RedisCacheModule } from '@nexus/redis-cache';
import {
  ConfigurationModule,
  ServiceConfiguration,
} from '@nexus/configuration';

@Module({
  imports: [
    DatabaseModule,
    ConfigurationModule.forRoot('auth-service'),
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
    TeamModule,
    // Module utilitaire
    OtpModule,
    RedisCacheModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AuthServiceModule {}

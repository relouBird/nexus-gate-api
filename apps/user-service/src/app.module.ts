import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@nexus/database';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { UserModule } from './user/user.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RedisCacheModule } from '@nexus/redis-cache';
import {
  ConfigurationModule,
  ServiceConfiguration,
} from '@nexus/configuration';

@Module({
  imports: [
    DatabaseModule,
    ConfigurationModule.forRoot('user-service'),
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
    UserModule,
    NotificationsModule,

    // Les utilitaires
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class UserServiceModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { PrismaService } from './prisma/prisma.service';
import { TeamModule } from './team/team.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { NotificationsModule } from './mail/notifications/notifications.module';
import {
  ConfigurationModule,
  ServiceConfiguration,
} from '@nexus/configuration';

@Module({
  imports: [
    PrismaModule,
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
    RedisModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AuthServiceModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './app.constants';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { PrismaService } from './prisma/prisma.service';
import { TeamModule } from './team/team.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { NotificationsModule } from './mail/notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env',
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, // '60s', '15m','1h', '7d', etc.
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

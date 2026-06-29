import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './app.constants';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';
import { ServerModule } from './server/server.module';
import { RuleModule } from './rule/rule.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/configuration-service/.env',
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, // '60s', '15m','1h', '7d', etc.
    }),
    // Les modules métiers...
    ServerModule,
    RuleModule,
    TokenModule,

    // Les utilitaires
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class UserServiceModule {}

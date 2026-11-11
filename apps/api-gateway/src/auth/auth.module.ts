import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisCacheModule } from '@nexus/redis-cache';
import { ClientsGatewayModule } from '../clients-gateway/clients-gateway.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { ServiceConfiguration } from '@nexus/configuration';

@Module({
  imports: [
    RedisCacheModule,
    ClientsGatewayModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ServiceConfiguration],
      useFactory: (config: ServiceConfiguration) => ({
        secret: config.getSharedOrThrow('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}

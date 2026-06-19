// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule } from '@nestjs/config';

@Global() // disponible partout sans ré-import, comme PrismaService
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/auth-service/.env',
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}

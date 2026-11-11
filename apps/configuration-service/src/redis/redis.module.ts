// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // disponible partout sans ré-import, comme PrismaService
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}

// redis.module.ts
import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';

@Module({
  imports: [],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}

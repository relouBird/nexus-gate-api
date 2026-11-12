import { Module } from '@nestjs/common';
import { DatabaseModule } from '@nexus/database';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}

import { Module } from '@nestjs/common';
import { GatewayTokenController } from './gateway-token.controller';
import { GatewayTokenService } from './gateway-token.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GatewayTokenController],
  providers: [GatewayTokenService],
  exports: [GatewayTokenService],
})
export class GatewayTokenModule {}

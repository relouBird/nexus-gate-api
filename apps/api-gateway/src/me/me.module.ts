// redis.module.ts
import { Module } from '@nestjs/common';
import { ClientsGatewayModule } from '../clients-gateway/clients-gateway.module';

import { MeService } from './me.service';
import { MeController } from './me.controller';

@Module({
  imports: [ClientsGatewayModule],
  controllers: [MeController],
  providers: [MeService],
  exports: [MeService],
})
export class MeModule {}

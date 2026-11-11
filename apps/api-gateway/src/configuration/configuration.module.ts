// redis.module.ts
import { Module } from '@nestjs/common';
import { ClientsGatewayModule } from '../clients-gateway/clients-gateway.module';

import { ConfigurationService } from './configuration.service';
import { ConfigurationController } from './configuration.controller';

@Module({
  imports: [ClientsGatewayModule],
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}

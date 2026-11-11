// redis.module.ts
import { Module } from '@nestjs/common';
import { ClientsGatewayModule } from '../clients-gateway/clients-gateway.module';

import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [ClientsGatewayModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}

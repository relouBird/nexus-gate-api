// redis.module.ts
import { Module } from '@nestjs/common';
import { ClientsGatewayModule } from '../clients-gateway/clients-gateway.module';

import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [ClientsGatewayModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

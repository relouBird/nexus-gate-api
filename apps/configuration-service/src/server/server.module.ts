import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { DatabaseModule } from '@nexus/database';
import { ServerController } from './server.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerService],
})
export class ServerModule {}

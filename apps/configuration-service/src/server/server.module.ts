import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ServerController } from './server.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerService],
})
export class ServerModule {}

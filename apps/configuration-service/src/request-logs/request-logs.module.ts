import { Module } from '@nestjs/common';
import { RequestLogsService } from './request-logs.service';
import { RequestLogsController } from './request-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RequestLogsController],
  providers: [RequestLogsService],
})
export class RequestLogsModule {}

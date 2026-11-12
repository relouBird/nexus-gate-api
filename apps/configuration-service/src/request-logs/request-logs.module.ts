import { Module } from '@nestjs/common';
import { RequestLogsService } from './request-logs.service';
import { RequestLogsController } from './request-logs.controller';

import { DatabaseModule } from '@nexus/database';

@Module({
  imports: [DatabaseModule],
  controllers: [RequestLogsController],
  providers: [RequestLogsService],
})
export class RequestLogsModule {}

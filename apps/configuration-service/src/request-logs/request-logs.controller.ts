import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestLogsService } from './request-logs.service';
import { CONFIGURATION_PATTERNS } from '../app.constants';
import { GetLogsDto } from './request-logs.dto';

@Controller()
export class RequestLogsController {
  constructor(private readonly requestLogsService: RequestLogsService) {}

  @MessagePattern(CONFIGURATION_PATTERNS.LOGS_FIND_ALL)
  findAll(@Payload() dto: GetLogsDto) {
    return this.requestLogsService.findAll(dto);
  }
}

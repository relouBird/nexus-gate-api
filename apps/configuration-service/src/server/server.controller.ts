import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ServerService } from './server.service';
import { CONFIGURATION_PATTERNS } from '../app.constants';
import {
  CreateServerDto,
  FindAllServersDto,
  FindOneServerDto,
  UpdateServerDto,
  TokenAuthServerDto,
  RevokeServerDto,
  GrantServerDto,
} from './server.dto';

@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_CREATE)
  create(@Payload() dto: CreateServerDto) {
    return this.serverService.create(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_FIND_ALL)
  findAll(@Payload() dto: FindAllServersDto) {
    return this.serverService.findAll(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_FIND_ONE)
  findOne(@Payload() dto: FindOneServerDto) {
    return this.serverService.findOne(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_UPDATE)
  update(@Payload() dto: UpdateServerDto) {
    return this.serverService.update(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_REMOVE)
  remove(@Payload() dto: FindOneServerDto) {
    return this.serverService.remove(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_TOKEN_AUTH)
  toggleTokenAuth(@Payload() dto: TokenAuthServerDto) {
    return this.serverService.toggleTokenAuth(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_REVOKE)
  revoke(@Payload() dto: RevokeServerDto) {
    return this.serverService.revoke(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.SERVER_GRANT)
  grant(@Payload() dto: GrantServerDto) {
    return this.serverService.grant(dto);
  }
}

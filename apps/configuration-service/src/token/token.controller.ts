import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TokenService } from './token.service';
import { CONFIGURATION_PATTERNS } from '../app.constants';
import {
  CreateGatewayTokenDto,
  FindAllGatewayTokensDto,
  RemoveGatewayTokenDto,
} from './token.dto';

@Controller()
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @MessagePattern(CONFIGURATION_PATTERNS.GATEWAY_TOKEN_CREATE)
  create(@Payload() dto: CreateGatewayTokenDto) {
    return this.tokenService.create(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.GATEWAY_TOKEN_FIND_ALL)
  findAll(@Payload() dto: FindAllGatewayTokensDto) {
    return this.tokenService.findAll(dto);
  }

  @MessagePattern(CONFIGURATION_PATTERNS.GATEWAY_TOKEN_REMOVE)
  remove(@Payload() dto: RemoveGatewayTokenDto) {
    return this.tokenService.remove(dto);
  }
}

import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GatewayTokenService } from './gateway-token.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthContext } from '../common/interfaces/auth-context.interface';
import { CreateGatewayTokenDto } from './dto/create-gateway-token.dto';
import { RevokeGatewayTokenDto } from './dto/revoke-gateway-token.dto';
import { GATEWAY_TOKEN_PATTERNS } from './gateway-token.constants';

@ApiTags('Gateway-Tokens')
@ApiBearerAuth('access-token')
@Controller('gateway-tokens')
export class GatewayTokenController {
  constructor(private readonly gatewayTokenService: GatewayTokenService) {}

  /** POST /auth/gateway-tokens — Génère un GatewayToken. */
  @MessagePattern(GATEWAY_TOKEN_PATTERNS.GATEWAY_TOKEN_CREATE)
  createMessage(@Payload() dto: CreateGatewayTokenDto) {
    return this.gatewayTokenService.createGatewayToken(dto);
  }

  /** GET /auth/gateway-tokens — Liste les GatewayTokens de la Team. */
  @MessagePattern(GATEWAY_TOKEN_PATTERNS.GATEWAY_TOKEN_FIND_ALL)
  findAllMessage(@Payload() dto: { requester: AuthContext }) {
    return this.gatewayTokenService.findAllGatewayTokens(dto.requester);
  }

  /** DELETE /auth/gateway-tokens/:id — Révoque un GatewayToken. */
  @MessagePattern(GATEWAY_TOKEN_PATTERNS.GATEWAY_TOKEN_REVOKE)
  revokeMessage(@Payload() dto: RevokeGatewayTokenDto) {
    return this.gatewayTokenService.revokeGatewayToken(dto);
  }
}

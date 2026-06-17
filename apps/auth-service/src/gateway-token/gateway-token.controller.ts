import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GatewayTokenService } from './gateway-token.service';
import type { RequestAuth } from '../types/auth.type';

@ApiTags('Gateway-Tokens')
@ApiBearerAuth('access-token')
@Controller('gateway-tokens')
export class GatewayTokenController {
  constructor(private tokenService: GatewayTokenService) {}

  /**
   * =========================
   * 🔐 ROUTE ALL GATEWAY-TOKENS
   * =========================
   * GET /gateway-tokens/all
   * Route pour avoir les informations sur les tokens de passerelle api.
   */
  @HttpCode(HttpStatus.OK)
  @Get('all')
  @ApiOperation({ summary: 'Liste de tous les portes feuilles électroniques' })
  GetAllWallets(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.tokenService.getAllTokens();
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import type { AuthRequest } from '../common/interfaces/auth-context.interface';
import { ConfigurationService } from './configuration.service';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  private validateRequestBody(body: any) {
    if (body === null || body === undefined) {
      throw new BadRequestException('Request body is required');
    }
  }

  // ============================================================
  // 🖥️ SERVERS
  // ============================================================

  /**
   * POST /configuration/servers
   * Création d'un serveur
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('servers')
  createServer(@Request() req: AuthRequest, @Body() dto: any) {
    this.validateRequestBody(dto);
    return this.configurationService.createServer(dto, req.user);
  }

  /**
   * GET /configuration/servers
   * Liste des serveurs de l'équipe
   */
  @HttpCode(HttpStatus.OK)
  @Get('servers')
  getServers(@Request() req: AuthRequest) {
    return this.configurationService.getServers(req.user);
  }

  /**
   * GET /configuration/servers/:id
   * Détails d'un serveur
   */
  @HttpCode(HttpStatus.OK)
  @Get('servers/:id')
  getServer(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.configurationService.getServer(id, req.user);
  }

  /**
   * PATCH /configuration/servers/:id
   * Modification d'un serveur
   */
  @HttpCode(HttpStatus.OK)
  @Patch('servers/:id')
  updateServer(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    this.validateRequestBody(dto);
    return this.configurationService.updateServer(id, dto, req.user);
  }

  /**
   * DELETE /configuration/servers/:id
   * Suppression d'un serveur
   */
  @HttpCode(HttpStatus.OK)
  @Delete('servers/:id')
  deleteServer(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.configurationService.deleteServer(id, req.user);
  }

  /**
   * PATCH /configuration/servers/:id/token-auth
   * Active/Désactive requireToken
   */
  @HttpCode(HttpStatus.OK)
  @Patch('servers/:id/token-auth')
  updateTokenRequirement(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    this.validateRequestBody(dto);
    return this.configurationService.updateTokenRequirement(id, dto, req.user);
  }

  /**
   * POST /configuration/servers/:id/revoke
   * Retire l'accès à ce serveur à tous les utilisateurs concernés
   */
  @HttpCode(HttpStatus.OK)
  @Post('servers/:id/revoke')
  revokeServer(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.configurationService.revokeServer(id, req.user);
  }

  /**
   * POST /configuration/servers/:id/grant
   * Redonne l'accès à une liste d'utilisateurs
   */
  @HttpCode(HttpStatus.OK)
  @Post('servers/:id/grant')
  grantServer(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    this.validateRequestBody(dto);
    return this.configurationService.grantServer(id, dto, req.user);
  }

  // ============================================================
  // 📜 RULES
  // ============================================================

  /**
   * POST /configuration/servers/:id/rules
   * Création d'une règle
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('servers/:id/rules')
  createRule(
    @Request() req: AuthRequest,
    @Param('id') serverId: string,
    @Body() dto: any,
  ) {
    this.validateRequestBody(dto);
    return this.configurationService.createRule(serverId, dto, req.user);
  }

  /**
   * GET /configuration/servers/:id/rules
   * Liste des règles d'un serveur
   */
  @HttpCode(HttpStatus.OK)
  @Get('servers/:id/rules')
  getRules(@Request() req: AuthRequest, @Param('id') serverId: string) {
    return this.configurationService.getRules(serverId, req.user);
  }

  /**
   * GET /configuration/servers/rules
   * Liste des règles de tous les serveurs
   */
  @HttpCode(HttpStatus.OK)
  @Get('rules')
  getAllRules(@Request() req: AuthRequest) {
    return this.configurationService.getAllRules(req.user);
  }

  /**
   * PATCH /configuration/rules/:id
   * Modification d'une règle
   */
  @HttpCode(HttpStatus.OK)
  @Patch('rules/:id')
  updateRule(
    @Request() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    this.validateRequestBody(dto);
    return this.configurationService.updateRule(id, dto, req.user);
  }

  /**
   * DELETE /configuration/rules/:id
   * Suppression d'une règle
   */
  @HttpCode(HttpStatus.OK)
  @Delete('rules/:id')
  deleteRule(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.configurationService.deleteRule(id, req.user);
  }

  // ============================================================
  // 🔑 GATEWAY TOKENS
  // ============================================================

  /**
   * POST /configuration/gateway-tokens
   * Génère un GatewayToken
   */
  @HttpCode(HttpStatus.CREATED)
  @Post('gateway-tokens')
  createGatewayToken(@Request() req: AuthRequest, @Body() dto: any) {
    this.validateRequestBody(dto);
    return this.configurationService.createGatewayToken(dto, req.user);
  }

  /**
   * GET /configuration/gateway-tokens
   * Liste les GatewayTokens
   */
  @HttpCode(HttpStatus.OK)
  @Get('gateway-tokens')
  getGatewayTokens(@Request() req: AuthRequest) {
    return this.configurationService.getGatewayTokens(req.user);
  }

  /**
   * DELETE /configuration/gateway-tokens/:id
   * Révoque un GatewayToken
   */
  @HttpCode(HttpStatus.OK)
  @Delete('gateway-tokens/:id')
  revokeGatewayToken(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.configurationService.revokeGatewayToken(id, req.user);
  }
}

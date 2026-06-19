import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGatewayTokenDto } from './dto/create-gateway-token.dto';
import { RevokeGatewayTokenDto } from './dto/revoke-gateway-token.dto';
import { AuthContext } from '../common/interfaces/auth-context.interface';

@Injectable()
export class GatewayTokenService {
  private readonly logger = new Logger(GatewayTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /auth/gateway-tokens — Génère un GatewayToken pour le requester.
   */
  async createGatewayToken(dto: CreateGatewayTokenDto): Promise<any> {
    try {
      const { name, scope, requester } = dto;

      this.logger.log(
        `Message received on GatewayTokenService => Create (${name})`,
      );

      const token = await this.prisma.gatewayToken.create({
        data: {
          name,
          value: this.generateTokenValue(),
          scope: scope ?? '*',
          userId: requester.sub,
          teamId: requester.teamId,
        },
      });

      return token;
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        `Gateway token creation failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la création du gateway token',
      });
    }
  }

  /**
   * GET /auth/gateway-tokens — Liste les GatewayTokens actifs de la Team.
   */
  async findAllGatewayTokens(requester: AuthContext): Promise<any> {
    try {
      return await this.prisma.gatewayToken.findMany({
        where: { teamId: requester.teamId, revoked: false },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: any) {
      this.logger.error(
        `Gateway token listing failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message:
          'Une erreur est survenue lors de la récupération des gateway tokens',
      });
    }
  }

  /**
   * DELETE /auth/gateway-tokens/:id — Révoque un GatewayToken.
   */
  async revokeGatewayToken(dto: RevokeGatewayTokenDto): Promise<any> {
    try {
      const { id, requester } = dto;

      const token = await this.prisma.gatewayToken.findUnique({
        where: { id },
      });

      if (!token || token.teamId !== requester.teamId) {
        throw new RpcException({
          statusCode: 404,
          message: 'Gateway token introuvable',
        });
      }

      return await this.prisma.gatewayToken.update({
        where: { id },
        data: { revoked: true },
      });
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        `Gateway token revocation failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la révocation du gateway token',
      });
    }
  }

  private generateTokenValue(): string {
    return `gw_${crypto.randomBytes(24).toString('hex')}`;
  }
}

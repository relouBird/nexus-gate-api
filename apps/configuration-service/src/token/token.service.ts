import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import {
  CreateGatewayTokenDto,
  FindAllGatewayTokensDto,
  RemoveGatewayTokenDto,
} from './token.dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGatewayTokenDto) {
    try {
      const { requester, name, scope } = dto;
      this.logger.log(
        `Message received GATEWAY-TOKEN-CREATE: (${requester.sub})`,
      );

      const value = `gw_${randomBytes(24).toString('hex')}`;

      return await this.prisma.gatewayToken.create({
        data: {
          name,
          value,
          userId: requester.sub,
          teamId: requester.teamId,
          scope:
            scope && scope.length
              ? { create: scope.map((serverId) => ({ serverId })) }
              : undefined,
        },
        include: { scope: true },
      });
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `GatewayToken-Create failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la création du token',
      });
    }
  }

  async findAll(dto: FindAllGatewayTokensDto) {
    try {
      const { requester } = dto;
      this.logger.log(
        `Message received GATEWAY-TOKEN-FIND-ALL: (${requester.sub})`,
      );

      return await this.prisma.gatewayToken.findMany({
        where: { teamId: requester.teamId },
        include: { scope: true },
      });
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `GatewayToken-FindAll failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la récupération des tokens',
      });
    }
  }

  async remove(dto: RemoveGatewayTokenDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received GATEWAY-TOKEN-REMOVE: (${id})`);

      const token = await this.prisma.gatewayToken.findFirst({
        where: { id, teamId: requester.teamId },
      });
      if (!token)
        throw new RpcException({
          statusCode: 404,
          message: 'Token introuvable',
        });

      // Flag cosmétique pour l'instant, comme demandé
      return await this.prisma.gatewayToken.update({
        where: { id },
        data: { revoked: true },
      });
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(
        `GatewayToken-Remove failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la révocation du token',
      });
    }
  }
}

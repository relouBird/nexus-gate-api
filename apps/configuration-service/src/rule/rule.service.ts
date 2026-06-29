import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRuleDto,
  FindAllRulesDto,
  UpdateRuleDto,
  FindOneRuleDto,
} from './rule.dto';

@Injectable()
export class RuleService {
  private readonly logger = new Logger(RuleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRuleDto) {
    try {
      const { requester, serverId, ...data } = dto;
      this.logger.log(`Message received RULE-CREATE: (${serverId})`);

      const server = await this.prisma.server.findFirst({
        where: { id: serverId, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      const rule = await this.prisma.rule.create({
        data: { serverId, ...data } as any,
      });
      return {
        rule,
        message: 'Règle créée avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Rule-Create failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la création de la règle',
      });
    }
  }

  async findAll(dto: FindAllRulesDto) {
    try {
      const { requester, serverId } = dto;
      this.logger.log(`Message received RULE-FIND-ALL: (${serverId})`);

      const server = await this.prisma.server.findFirst({
        where: { id: serverId, teamId: requester.teamId },
      });
      if (!server)
        throw new RpcException({
          statusCode: 404,
          message: 'Serveur introuvable',
        });

      const rules = await this.prisma.rule.findMany({ where: { serverId } });

      return {
        rules,
        total: rules.length,
        message: 'Règle récuperées avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Rule-FindAll failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la récupération des règles',
      });
    }
  }

  async findOne(dto: FindOneRuleDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received RULE-REMOVE: (${id})`);

      const rule = await this.prisma.rule.findFirst({
        where: { id, server: { teamId: requester.teamId } },
      });
      if (!rule)
        throw new RpcException({
          statusCode: 404,
          message: 'Règle introuvable',
        });

      return {
        rule,
        message: 'Règle récuperée avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Rule-Remove failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la suppression de la règle',
      });
    }
  }

  async update(dto: UpdateRuleDto) {
    try {
      const { requester, id, ...data } = dto;
      this.logger.log(`Message received RULE-UPDATE: (${id})`);

      const rule = await this.prisma.rule.findFirst({
        where: { id, server: { teamId: requester.teamId } },
      });
      if (!rule)
        throw new RpcException({
          statusCode: 404,
          message: 'Règle introuvable',
        });

      const updated = await this.prisma.rule.update({ where: { id }, data });

      return {
        rule: updated,
        message: 'Règle mis à jour avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Rule-Update failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la mise à jour de la règle',
      });
    }
  }

  async remove(dto: FindOneRuleDto) {
    try {
      const { requester, id } = dto;
      this.logger.log(`Message received RULE-REMOVE: (${id})`);

      const rule = await this.prisma.rule.findFirst({
        where: { id, server: { teamId: requester.teamId } },
      });
      if (!rule)
        throw new RpcException({
          statusCode: 404,
          message: 'Règle introuvable',
        });

      const deleted = await this.prisma.rule.delete({ where: { id } });

      return {
        message: 'Detruit avec succès...',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error(`Rule-Remove failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: 'Erreur lors de la suppression de la règle',
      });
    }
  }
}

// gateway-tokens/gateway-tokens.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer toutes les equipes
   */
  async getAllTeams() {
    const teams = await this.prisma.team.findMany({
      include: {
        users: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return teams;
  }
}

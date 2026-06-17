// gateway-tokens/gateway-tokens.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayToken } from '../generated/prisma-client';

@Injectable()
export class GatewayTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupérer tous les tokens de gateway
   */
  async getAllTokens() {
    const datas = {} as GatewayToken;
    const tokens = await this.prisma.gatewayToken.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tokens;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Otp, Prisma } from '../generated/prisma-client';
import { PrismaService } from '../prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import * as crypto from 'crypto';

const DEFAULT_OTP_TTL_SECONDS = 300;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  constructor(private prisma: PrismaService) {}

  async createOtp(data: Prisma.OtpCreateInput) {
    return this.prisma.otp.create({
      data,
    });
  }

  async findFirst(OtpWhereInput: Prisma.OtpWhereInput): Promise<Otp | null> {
    return this.prisma.otp.findFirst({
      where: OtpWhereInput,
    });
  }

  async updateOtp(id: number, data: Prisma.OtpUpdateInput) {
    return this.prisma.otp.update({
      where: { id },
      data,
    });
  }

  async generateAndSendOtp(email: string): Promise<any> {
    try {
      this.logger.log(`Message received on OtpService => Send (${email})`);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || user.deletedAt) {
        throw new RpcException({
          statusCode: 404,
          message: 'Utilisateur introuvable',
        });
      }

      // Invalide les anciens OTP non utilisés pour éviter qu'ils restent exploitables
      await this.prisma.otp.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
      });

      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

      await this.prisma.otp.create({
        data: {
          code,
          userId: user.id,
          expiresAt: new Date(Date.now() + DEFAULT_OTP_TTL_SECONDS * 1000),
        },
      });

      // TODO: brancher un vrai envoi (email/SMS). Stub pour l'instant.
      this.logger.log(`OTP généré pour ${email} (envoi non implémenté)`);

      return { sent: true };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`OTP generation failed: ${error.message}`, error.stack);
      throw new RpcException({
        statusCode: 500,
        message: "Une erreur est survenue lors de l'envoi du code OTP",
      });
    }
  }

  async findValidOtp(userId: string, code: string) {
    return this.prisma.otp.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });
  }
}

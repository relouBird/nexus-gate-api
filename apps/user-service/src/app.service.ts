import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from './prisma/prisma.service';

import { UserStatus } from './generated/prisma-client';
import { AuthContext } from './common/interfaces/auth-context.interface';
// import { NotificationsService } from './mail/notifications/notifications.service';

// Durée de session par défaut — même valeur que dans TeamService.registerTeam
// (à terme : factoriser dans une config partagée, ex: ConfigService)
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly notificationService: NotificationsService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * POST /auth/login — Authentifie un User et ouvre/rafraîchit sa Session.
   * `Session.userId` est unique : un nouveau login écrase la session
   * précédente (un seul appareil/session active à la fois, pour l'instant).
   */
  async login(): Promise<any> {
    try {
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Check failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la connexion',
      });
    }
  }

  // Test de communication avec le microservice
  getHello(): string {
    this.logger.log('Message received on AuthService => Hello World');

    return '🚀 AUTH SERVICE API is running successfully.';
  }
}

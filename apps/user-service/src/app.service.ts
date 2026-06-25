import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { UserStatus } from './generated/prisma-client';
import { GetMeDto } from './dto/get-me.dto';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserService } from './user/user.service';
import { AuthContextDto } from './common/interfaces/auth-context.dto';
import { NotificationsService } from './mail/notifications/notifications.service';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly redis: RedisService,
    private readonly notificationService: NotificationsService,
  ) {}

  async getMe(dto: GetMeDto): Promise<any> {
    try {
      const { requester } = dto;

      this.logger.log(`Message received GET-ME: (${requester.sub})`);

      const user = await this.checkUser(requester);

      const team = await this.prisma.team.findUnique({
        where: {
          id: user.teamId ?? '',
        },
      });

      return {
        team,
        user: {
          ...user,
          passwordHash: undefined,
          deletedAt: undefined,
        },
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Get-Me failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la connexion',
      });
    }
  }

  async changeUsername(dto: ChangeUsernameDto): Promise<any> {
    try {
      const { username, requester } = dto;

      this.logger.log(`Message received CHANGE-USERNAME: (${requester.sub})`);

      let user = await this.checkUser(requester);

      user = await this.userService.updateUser({
        where: {
          id: user.id,
        },
        data: {
          username,
        },
      });

      const team = await this.prisma.team.findUnique({
        where: {
          id: user.teamId ?? '',
        },
      });

      return {
        team,
        user: {
          ...user,
          passwordHash: undefined,
          deletedAt: undefined,
        },
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        `Change Username failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la connexion',
      });
    }
  }

  async changePassword(dto: ChangePasswordDto): Promise<any> {
    try {
      const { password, newPassword, requester } = dto;

      this.logger.log(`Message received CHANGE-PASSWORD: (${requester.sub})`);

      let user = await this.checkUser(requester);

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        throw new RpcException({
          statusCode: 400,
          message: 'Mot de Passe Incorrect',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user = await this.userService.updateUser({
        where: {
          id: user.id,
        },
        data: {
          passwordHash: hashedPassword,
        },
      });

      await this.notificationService.send({
        type: 'PASSWORD_CHANGED',
        email: user.email,
        payload: {
          userName: user.username,
          changedAt: new Date().toDateString(),
        },
      });

      const team = await this.prisma.team.findUnique({
        where: {
          id: user.teamId ?? '',
        },
      });

      return {
        team,
        user: {
          ...user,
          passwordHash: undefined,
          deletedAt: undefined,
        },
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(
        `Password change failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors du changement de mot de passe',
      });
    }
  }

  async deleteAccount(dto: GetMeDto): Promise<any> {
    try {
      const { requester } = dto;

      this.logger.log(`Message received DELETE-ACCOUNT: (${requester.sub})`);

      const user = await this.checkUser(requester);

      await this.userService.deleteUser({ id: user.id });

      await this.redis.del(`session:${requester.sub}`);

      return {
        user: {
          ...user,
          passwordHash: undefined,
          deletedAt: undefined,
        },
        success: true,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Delete-Account failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la connexion',
      });
    }
  }

  // Test de communication avec le microservice
  getHello(): string {
    this.logger.log('Message received on USER-SERVICE : Hello World');

    return '🚀 AUTH SERVICE API is running successfully.';
  }

  private async checkUser(requester: AuthContextDto) {
    const user = await this.userService.user({ id: requester.sub });

    if (!user || user.deletedAt) {
      throw new RpcException({
        statusCode: 401,
        message: 'Utilisateur introuvable',
      });
    }

    if (user.status == UserStatus.UNAUTHENTICATED) {
      throw new RpcException({
        statusCode: 401,
        message: 'Veillez verifier votre email.',
      });
    }

    if (user.teamId != requester.teamId) {
      throw new RpcException({
        statusCode: 401,
        message: 'Votre Team est bloquante...',
      });
    }

    return user;
  }
}

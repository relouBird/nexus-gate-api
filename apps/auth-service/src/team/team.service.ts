import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { DeleteTeamDto } from './dto/delete-team.dto';
import { OtpService } from '../otp/otp.service';
import { AuthContext } from '../common/interfaces/auth-context.interface';
import { NotificationsService } from '../mail/notifications/notifications.service';
import { UpdateTeamDto } from './dto/update-team.dto';

// Durée de session par défaut — à aligner sur JWT_EXPIRES_IN (doc : 7d)
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly otpService: OtpService,
    private readonly notificationService: NotificationsService,
  ) {}

  /**
   * Crée une Team et son compte CREATOR, puis ouvre une session
   * (JWT + Session en DB), comme un register classique mais avec
   * la Team créée en amont.
   */
  async registerTeam(dto: RegisterTeamDto): Promise<any> {
    try {
      const { teamName, username, email, password, confirmPassword } = dto;

      this.logger.log(`Message received on TeamService => Register (${email})`);

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (password != confirmPassword) {
        throw new RpcException({
          statusCode: 409,
          message: 'Vos mots de passe ne correspondent pas.',
        });
      }

      if (existingUser && !existingUser.deletedAt) {
        throw new RpcException({
          statusCode: 409,
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      const slug = await this.generateUniqueSlug(teamName);
      const hashedPassword = await bcrypt.hash(password, 10);

      const { team, user } = await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
          data: { name: teamName, slug },
        });

        await tx.session.deleteMany({
          where: {
            user: {
              email,
            },
          },
        });

        const user = await tx.user.upsert({
          where: { email: dto.email },
          update: {
            username,
            email,
            passwordHash: hashedPassword,
            role: 'CREATOR',
            team: { connect: { id: team.id } },
            deletedAt: null,
          },
          create: {
            username,
            email,
            passwordHash: hashedPassword,
            role: 'CREATOR',
            team: { connect: { id: team.id } },
          },
        });

        return { team, user };
      });

      const jti = crypto.randomUUID();

      const payload: AuthContext = {
        sub: user.id,
        teamId: team.id,
        role: user.role,
        expiredAt: new Date(Date.now() + DEFAULT_SESSION_TTL_SECONDS * 1000),
        jti,
      };

      const accessToken = await this.jwt.signAsync(payload);
      const refreshToken = crypto.randomBytes(32).toString('hex');
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

      await this.prisma.session.create({
        data: {
          userId: user.id,
          accessToken,
          refreshToken,
          expiresIn: DEFAULT_SESSION_TTL_SECONDS,
          expiresAt: new Date(Date.now() + DEFAULT_SESSION_TTL_SECONDS * 1000),
        },
      });

      await this.otpService.generateAndSendOtp(user.email, async (user) => {
        await this.notificationService.send({
          type: 'OTP',
          email: user.email,
          payload: {
            userName: user.username,
            purpose: 'login',
            otp: code,
          },
        });
        await this.notificationService.send({
          type: 'WELCOME_TEAM',
          email: user.email,
          payload: {
            userName: user.username,
            teamName: team.name,
            teamSlug: team.slug,
          },
        });
        return code;
      });

      return {
        team,
        user: {
          id: user.id,
          username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        status: user.status.toLocaleLowerCase(),
        accessToken: null,
        refreshToken: null,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        `Team registration failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la création de la team',
      });
    }
  }

  /**
   * Mettre à jour la Team du requester (+ cascade). Réservé au CREATOR.
   */
  async updateTeam(dto: UpdateTeamDto): Promise<any> {
    try {
      const { name, slug, requester } = dto;

      this.logger.log(
        `Message received on TeamService => Delete (${requester.teamId})`,
      );

      if (requester.role !== 'CREATOR') {
        throw new RpcException({
          statusCode: 403,
          message: 'Seul le créateur de la team peut la mettre à jour',
        });
      }

      const existing = await this.prisma.team.findUnique({
        where: {
          slug,
        },
      });

      if (existing && existing.id != requester.teamId) {
        throw new RpcException({
          statusCode: 403,
          message:
            'Votre slug est déjà utilisé par un autre organisme. Veuillez en utiliser un autre',
        });
      }

      const team = await this.prisma.team.update({
        where: { id: requester.teamId },
        data: {
          name,
          slug,
        },
      });

      return { team, success: true };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Team deletion failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la suppression de la team',
      });
    }
  }

  /**
   * Supprime la Team du requester (+ cascade). Réservé au CREATOR.
   */
  async deleteTeam(dto: DeleteTeamDto): Promise<any> {
    try {
      const { requester } = dto;

      this.logger.log(
        `Message received on TeamService => Delete (${requester.teamId})`,
      );

      if (requester.role !== 'CREATOR') {
        throw new RpcException({
          statusCode: 403,
          message: 'Seul le créateur de la team peut la supprimer',
        });
      }

      await this.prisma.user.updateMany({
        where: {
          team: {
            id: requester.teamId,
          },
        },
        data: {
          deletedAt: new Date(),
          teamId: null,
        },
      });

      await this.prisma.team.delete({ where: { id: requester.teamId } });

      return { success: true };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Team deletion failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la suppression de la team',
      });
    }
  }

  // ─── Helpers internes ──────────────────────────────────────────

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name) || 'team';
    let slug = base;
    let attempts = 0;

    while (await this.prisma.team.findUnique({ where: { slug } })) {
      attempts += 1;
      slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
      if (attempts > 5) break; // sécurité anti-boucle infinie
    }

    return slug;
  }
}

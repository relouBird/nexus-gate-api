import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from './prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { ChangePasswordWithOtpDto } from './dto/change-password-with-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SendPasswordResetOtpDto } from './dto/send-password-reset-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserStatus } from './generated/prisma-client';
import { OtpService } from './otp/otp.service';
import { AuthContext } from './common/interfaces/auth-context.interface';
import { RedisService } from './redis/redis.service';
import { NotificationsService } from './mail/notifications/notifications.service';

// Durée de session par défaut — même valeur que dans TeamService.registerTeam
// (à terme : factoriser dans une config partagée, ex: ConfigService)
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24;

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly notificationService: NotificationsService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  /**
   * POST /auth/login — Authentifie un User et ouvre/rafraîchit sa Session.
   * `Session.userId` est unique : un nouveau login écrase la session
   * précédente (un seul appareil/session active à la fois, pour l'instant).
   */
  async login(dto: LoginDto): Promise<any> {
    try {
      const { email, password } = dto;

      this.logger.log(`Message received on AuthService => Login (${email})`);

      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user || user.deletedAt) {
        throw new RpcException({
          statusCode: 401,
          message: 'Email ou mot de passe incorrect',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new RpcException({
          statusCode: 401,
          message: 'Email ou mot de passe incorrect',
        });
      }

      if (user.status == UserStatus.UNAUTHENTICATED) {
        throw new RpcException({
          statusCode: 401,
          message: 'Veillez verifier votre email.',
        });
      }

      const jti = crypto.randomUUID();

      const payload: AuthContext = {
        sub: user.id,
        teamId: user.teamId ?? '',
        role: user.role,
        expiredAt: new Date(Date.now() + DEFAULT_SESSION_TTL_SECONDS * 1000),
        jti,
      };
      const accessToken = await this.jwt.signAsync(payload);
      const refreshToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(
        Date.now() + DEFAULT_SESSION_TTL_SECONDS * 1000,
      );

      await this.prisma.session.upsert({
        where: { userId: user.id },
        update: {
          accessToken,
          refreshToken,
          expiresIn: DEFAULT_SESSION_TTL_SECONDS,
          expiresAt,
          loggedOut: false,
        },
        create: {
          userId: user.id,
          accessToken,
          refreshToken,
          expiresIn: DEFAULT_SESSION_TTL_SECONDS,
          expiresAt,
        },
      });

      // Source de vérité pour l'AuthGuard :
      await this.redis.set(
        `session:${user.id}`,
        jti,
        DEFAULT_SESSION_TTL_SECONDS,
      );

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
        status: user.status.toLocaleLowerCase(),
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Login failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la connexion',
      });
    }
  }

  /**
   * POST /auth/logout — Invalide la session du requester (loggedOut = true).
   * `updateMany` plutôt que `update` : ne plante pas si aucune session
   * n'existe (déjà déconnecté, session jamais créée, etc.).
   *
   * Important : le Guard qui valide le JWT sur les routes protégées doit
   * désormais vérifier `Session.loggedOut === false` (et `expiresAt` dans
   * le futur) en plus de la signature du JWT — sinon un accessToken signé
   * reste valide même après logout.
   */
  async logout(dto: LogoutDto): Promise<any> {
    try {
      const { requester } = dto;

      this.logger.log(
        `Message received on AuthService => Logout (${requester.sub})`,
      );

      await this.prisma.session.updateMany({
        where: { userId: requester.sub },
        data: { loggedOut: true },
      });

      await this.redis.del(`session:${requester.sub}`);

      return { success: true };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(`Logout failed: ${error.message}`, error.stack);

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la déconnexion',
      });
    }
  }

  async sendOtp(dto: SendOtpDto): Promise<any> {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    const data = await this.otpService.generateAndSendOtp(
      dto.email,
      async (user) => {
        this.notificationService.send({
          type: 'OTP',
          email: user.email,
          payload: {
            otp: code,
            purpose: dto.action,
            userName: user.username,
          },
        });
        return code;
      },
    );

    return data;
  }

  async sendPasswordResetOtp(dto: SendPasswordResetOtpDto): Promise<any> {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
    const data = await this.otpService.generateAndSendOtp(
      dto.email,
      async (user) => {
        this.notificationService.send({
          type: 'OTP',
          email: user.email,
          payload: {
            otp: code,
            purpose: 'reset',
            userName: user.username,
          },
        });
        return code;
      },
    );

    return data;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<any> {
    try {
      const { email, code } = dto;

      this.logger.log(`Message received on OtpService => Verify (${email})`);

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || user.deletedAt) {
        throw new RpcException({
          statusCode: 404,
          message: 'Utilisateur introuvable',
        });
      }

      const otp = await this.otpService.findValidOtp(user.id, code);
      if (!otp) {
        throw new RpcException({
          statusCode: 400,
          message: 'Code OTP invalide ou expiré',
        });
      }

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          status: UserStatus.AUTHENTICATED,
        },
      });

      return { valid: true };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(
        `OTP verification failed: ${error.message}`,
        error.stack,
      );
      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la vérification du code OTP',
      });
    }
  }

  async changePasswordWithOtp(dto: ChangePasswordWithOtpDto): Promise<any> {
    try {
      const { email, code, password, confirmPassword } = dto;

      this.logger.log(
        `Message received on OtpService => ChangePassword (${email})`,
      );

      if (password !== confirmPassword) {
        throw new RpcException({
          statusCode: 400,
          message: 'Les mots de passe ne correspondent pas',
        });
      }

      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || user.deletedAt) {
        throw new RpcException({
          statusCode: 404,
          message: 'Utilisateur introuvable',
        });
      }

      const otp = await this.otpService.findValidOtp(user.id, code);
      if (!otp) {
        throw new RpcException({
          statusCode: 400,
          message: 'Code OTP invalide ou expiré',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword },
        }),
        this.prisma.otp.update({
          where: { id: otp.id },
          data: { used: true },
        }),
      ]);

      // Sécurité : on force une reconnexion après changement de mot de passe
      await this.prisma.session.updateMany({
        where: { userId: user.id },
        data: { loggedOut: true },
      });

      await this.redis.del(`session:${user.id}`);

      this.notificationService.send({
        type: 'PASSWORD_CHANGED',
        email: user.email,
        payload: {
          userName: user.username,
          changeDate: new Date().toDateString(),
        },
      });

      return { success: true };
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

  // Test de communication avec le microservice
  getHello(): string {
    this.logger.log('Message received on AuthService => Hello World');

    return '🚀 AUTH SERVICE API is running successfully.';
  }
}

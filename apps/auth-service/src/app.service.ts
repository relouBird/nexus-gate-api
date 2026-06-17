import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // Inscription d'un utilisateur
  async register(createUserDto: RegisterDto): Promise<any> {
    try {
      const { firstName, lastName, email, password } = createUserDto;

      this.logger.log(
        `Message received on AuthService => Register (${email})`,
      );

      // Vérifier l'unicité de l'email
      const userExist = await this.prisma.user.findUnique({
        where: { email },
      });

      if (userExist) {
        throw new RpcException({
          statusCode: 409,
          message: 'Un utilisateur avec cet email existe déjà',
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = await this.prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });

      // Générer le JWT
      const payload = {
        sub: user.id,
        email: user.email,
      };

      const accessToken = await this.jwt.signAsync(payload);

      return {
        user,
        accessToken,
      };
    } catch (error: any) {
      // Laisser passer les RpcException déjà construites
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        `Registration failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: "Une erreur est survenue lors de l'inscription",
      });
    }
  }

  // Connexion d'un utilisateur
  async login(loginDto: LoginDto): Promise<any> {
    try {
      const { email, password } = loginDto;

      this.logger.log(
        `Message received on AuthService => Login (${email})`,
      );

      // Vérifier que l'utilisateur existe
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new RpcException({
          statusCode: 401,
          message: 'Email ou mot de passe incorrect',
        });
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new RpcException({
          statusCode: 401,
          message: 'Email ou mot de passe incorrect',
        });
      }

      // Générer le JWT
      const payload = {
        sub: user.id,
        email: user.email,
      };

      const accessToken = await this.jwt.signAsync(payload);

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }

      this.logger.error(
        `Login failed: ${error.message}`,
        error.stack,
      );

      throw new RpcException({
        statusCode: 500,
        message: 'Une erreur est survenue lors de la connexion',
      });
    }
  }

  // Test de communication avec le microservice
  getHello(): string {
    this.logger.log(
      'Message received on AuthService => Hello World',
    );

    return '🚀 AUTH SERVICE API is running successfully.';
  }
}
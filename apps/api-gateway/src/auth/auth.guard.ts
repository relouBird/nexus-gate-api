import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './auth.public';
import { Reflector } from '@nestjs/core';
import {
  AuthContext,
  AuthRequest,
} from '../common/interfaces/auth-context.interface';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private redis: RedisService,
  ) {}

  /**
   * Détermine si la requête actuelle est autorisée à se poursuivre.
   * Vérifie si la route est publique et, le cas échéant, valide le jeton JWT.
   * @param context Le contexte d'exécution de la requête.
   * @returns Un booléen indiquant si la requête peut se poursuivre.
   * @throws Une exception UnauthorizedException si le jeton est manquant ou invalide.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 Voir cette condition
      return true;
    }

    const request: AuthRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: AuthContext = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const storedJti = await this.redis.get(`session:${payload.sub}`);
      if (!storedJti || storedJti !== payload.jti) {
        throw new UnauthorizedException('Session expirée ou révoquée');
      }

      const expiredNumb = new Date(payload.expiredAt);

      if (Date.now() > expiredNumb.getTime()) {
        throw new UnauthorizedException('Token expired...');
      }

      // 💡 Nous attribuons ici le payload à l'objet de la requête
      // afin que nous puissions y accéder dans nos gestionnaires de routes
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException(
        (error as any)?.message || 'Invalid token',
      );
    }
    return true;
  }

  /**
   * Extracts the token from the Authorization header.
   * @param request The incoming HTTP request.
   * @returns The extracted token or undefined if not found.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

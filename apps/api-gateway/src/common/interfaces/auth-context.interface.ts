import { Request } from 'express';

/**
 * Représente l'utilisateur authentifié, tel que décodé depuis le JWT
 * par le service en amont (gateway / forwarding) avant l'émission
 * du message pattern. Correspond au payload signé par l'Auth Service :
 * { sub, teamId, role, jti }.
 *
 * Convention : tout DTO d'une route protégée (JWT) porte un champ
 * `requester: AuthContext` rempli par l'appelant, jamais par le client final.
 */
export interface AuthContext {
  sub: string; // id de l'utilisateur authentifié
  teamId: string; // team de l'utilisateur authentifié
  role: any | string; // rôle de l'utilisateur authentifié
  expiredAt: Date | string | number;
  jti: string;
}

export interface AuthRequest extends Request {
  user: AuthContext;
}

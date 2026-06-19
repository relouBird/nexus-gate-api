import { AuthContext } from '../common/interfaces/auth-context.interface';

/**
 * Invalide la session du requester. Route protégée : `requester` est rempli
 * par le service en amont après validation du JWT.
 */
export class LogoutDto {
  requester!: AuthContext;
}

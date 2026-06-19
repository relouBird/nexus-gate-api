import { AuthContext } from '../../common/interfaces/auth-context.interface';

/**
 * Supprime la Team du requester (+ cascade Users / GatewayTokens / Servers).
 * Pas d'`:id` dans la route documentée : on supprime toujours la Team
 * du requester, jamais une Team arbitraire.
 */
export class DeleteTeamDto {
  requester!: AuthContext;
}

import { IsUUID } from 'class-validator';
import { AuthContext } from '../../common/interfaces/auth-context.interface';

/**
 * Révoque (soft) un GatewayToken — passe `revoked` à true.
 * Le token doit appartenir à la Team du requester.
 */
export class RevokeGatewayTokenDto {
  @IsUUID()
  id!: string;

  requester!: AuthContext;
}

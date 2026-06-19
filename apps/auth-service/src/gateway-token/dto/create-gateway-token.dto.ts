import { IsOptional, IsString } from 'class-validator';
import { AuthContext } from '../../common/interfaces/auth-context.interface';

/**
 * Génère un GatewayToken pour le requester, dans sa Team.
 * `scope` : "*" (tous les serveurs) ou "id1,id2,id3" — défaut "*".
 */
export class CreateGatewayTokenDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  scope?: string;

  requester!: AuthContext;
}

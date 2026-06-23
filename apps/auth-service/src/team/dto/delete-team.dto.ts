import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { AuthContextDto } from '../../common/interfaces/auth-context.dto';

/**
 * Supprime la Team du requester (+ cascade Users / GatewayTokens / Servers).
 * Pas d'`:id` dans la route documentée : on supprime toujours la Team
 * du requester, jamais une Team arbitraire.
 */
export class DeleteTeamDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

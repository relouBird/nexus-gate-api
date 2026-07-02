import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { AuthContextDto } from '../../common/interfaces/auth-context.dto';

/**
 * Supprime la Team du requester (+ cascade Users / GatewayTokens / Servers).
 * Pas d'`:id` dans la route documentée : on supprime toujours la Team
 * du requester, jamais une Team arbitraire.
 */
export class UpdateTeamDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  slug!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

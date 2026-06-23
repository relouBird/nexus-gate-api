import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';

/**
 * Invalide la session du requester. Route protégée : `requester` est rempli
 * par le service en amont après validation du JWT.
 */
export class GetMeDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

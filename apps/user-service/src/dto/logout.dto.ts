import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { UserRole } from '../generated/prisma-client';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';
// import { AuthContext } from '../common/interfaces/auth-context.interface';

/**
 * Invalide la session du requester. Route protégée : `requester` est rempli
 * par le service en amont après validation du JWT.
 */
export class LogoutDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

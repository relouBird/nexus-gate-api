import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthContextDto } from '../../common/interfaces/auth-context.dto';

/**
 * Supprime (soft-delete) un User de la Team du requester.
 * Réservé au CREATOR. Le CREATOR lui-même ne peut pas être supprimé ici.
 */
export class DeleteUserDto {
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

import { IsUUID } from 'class-validator';
import { AuthContext } from '../../common/interfaces/auth-context.interface';

/**
 * Supprime (soft-delete) un User de la Team du requester.
 * Réservé au CREATOR. Le CREATOR lui-même ne peut pas être supprimé ici.
 */
export class DeleteUserDto {
  @IsUUID()
  id!: string;

  requester!: AuthContext;
}

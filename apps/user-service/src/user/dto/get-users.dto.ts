import {

  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuthContextDto } from '../../common/interfaces/auth-context.dto';

/**
 * Crée un User dans la Team du requester. Réservé au CREATOR.
 * `role` ne peut être que ADMIN ou CLIENT — CREATOR est rejeté en service
 * (un seul CREATOR par Team, fixé via team.register).
 */
export class GetUsersDto {

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

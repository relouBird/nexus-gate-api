import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../generated/prisma-client';
import { AuthContext } from '../../common/interfaces/auth-context.interface';

/**
 * Crée un User dans la Team du requester. Réservé au CREATOR.
 * `role` ne peut être que ADMIN ou CLIENT — CREATOR est rejeté en service
 * (un seul CREATOR par Team, fixé via team.register).
 */
export class CreateUserDto {
  @IsString()
  username!: string;


  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  requester!: AuthContext;
}

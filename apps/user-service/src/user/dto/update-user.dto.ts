import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { UserRole } from '../../generated/prisma-client';
import { Type } from 'class-transformer';
import { AuthContextDto } from '../../common/interfaces/auth-context.dto';
import { AccessPolicyDto } from './access-policy.dto';

/**
 * Crée un User dans la Team du requester. Réservé au CREATOR.
 * `role` ne peut être que ADMIN ou CLIENT — CREATOR est rejeté en service
 * (un seul CREATOR par Team, fixé via team.register).
 */
export class UpdateUserDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
    {
      message:
        'Le mot de passe doit contenir au minimum une Majuscule, une Minuscule, un Nombre, et un Caractère Spécial',
    },
  )
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role!: UserRole;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AccessPolicyDto)
  accessPolicy!: AccessPolicyDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

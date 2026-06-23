import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { UserRole } from '../../generated/prisma-client';

export class AuthContextDto {
  /**
   * Identifiant de l'utilisateur authentifié.
   */
  @IsNotEmpty()
  @IsString()
  sub!: string;

  /**
   * Identifiant de la team de l'utilisateur.
   */
  @IsNotEmpty()
  @IsString()
  teamId!: string;

  /**
   * Rôle de l'utilisateur authentifié.
   */
  @IsNotEmpty()
  @IsEnum(UserRole)
  role!: UserRole;

  /**
   * Date d'expiration du token.
   */
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiredAt!: Date;

  /**
   * Identifiant unique du JWT.
   */
  @IsNotEmpty()
  @IsString()
  jti!: string;

  // 👇 AJOUT IMPORTANT
  @IsOptional()
  @IsNumber()
  iat?: number;

  @IsOptional()
  @IsNumber()
  exp?: number;
}

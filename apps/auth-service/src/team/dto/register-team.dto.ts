import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Crée une Team + son compte CREATOR en une seule opération.
 * Route publique (pas de requester).
 */
export class RegisterTeamDto {
  @IsString()
  teamName!: string;

  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}

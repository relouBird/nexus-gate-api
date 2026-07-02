import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  ValidateIf,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&\-_])[A-Za-z\d@$!%*?&\-_]+$/, {
    message:
      'Le mot de passe doit au minimum une Majuscule, une Minuscule, un  Nombre, and un Caractère Special',
  })
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&\-_])[A-Za-z\d@$!%*?&\-_]+$/, {
    message:
      'Le mot de passe doit au minimum une Majuscule, une Minuscule, un  Nombre, and un Caractère Special',
  })
  @ValidateIf((o, value) => value !== o.password)
  confirmPassword!: string;
}

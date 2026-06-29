import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';

export class ChangePasswordWithOtpDto {
  @IsNotEmpty({ message: "L'email ne doit pas être vide" })
  @IsEmail({}, { message: "Respecter le format de l'email" })
  email!: string;

  @IsNotEmpty({ message: 'Le ne doit pas être vide' })
  @IsString({ message: 'Le code est une chaine de caractères' })
  code!: string;

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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Le mot de passe doit au minimum une Majuscule, une Minuscule, un  Nombre, and un Caractère Special',
  })
  @ValidateIf((o, value) => value !== o.password)
  confirmPassword!: string;
}

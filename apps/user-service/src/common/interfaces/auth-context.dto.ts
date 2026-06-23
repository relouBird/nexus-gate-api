import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsNumber,
  MinLength,
  Matches,
  ValidateNested,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
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

// Décorateur personnalisé : Doit être différent
export function IsNotEqualTo(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value !== relatedValue;
        },
      },
    });
  };
}

// Décorateur personnalisé : Doit être identique
export function IsEqualTo(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEqualTo',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
      },
    });
  };
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Le mot de passe doit contenir au minimum une Majuscule, une Minuscule, un Nombre, et un Caractère Spécial',
    },
  )
  password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Le mot de passe doit contenir au minimum une Majuscule, une Minuscule, un Nombre, et un Caractère Spécial',
    },
  )
  @IsNotEqualTo('password', {
    message: 'Le nouveau mot de passe doit être différent du précédent',
  })
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  @IsEqualTo('newPassword', {
    message: 'La confirmation du nouveau mot de passe est incorrecte',
  })
  confirmNewPassword!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

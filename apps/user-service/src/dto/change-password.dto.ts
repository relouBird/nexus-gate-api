import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  AuthContextDto,
  IsEqualTo,
  IsNotEqualTo,
} from '../common/interfaces/auth-context.dto';

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

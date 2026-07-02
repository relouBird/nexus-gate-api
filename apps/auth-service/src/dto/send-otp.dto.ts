import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum OtpAction {
  LOGIN = 'login',
  RESET = 'reset',
}

export class SendOtpDto {
  @IsNotEmpty({ message: "L'adresse email est obligatoire" })
  @IsEmail({}, { message: "L'adresse email n'est pas valide" })
  email!: string;

  @IsNotEmpty({ message: "L'action est obligatoire" })
  @IsString({ message: "L'action doit être une chaîne de caractères" })
  @Transform(({ value }) => value?.toLowerCase()) // 👈 important
  @IsEnum(OtpAction, { message: "L'action doit être 'login' ou 'reset'" })
  action!: OtpAction;
}

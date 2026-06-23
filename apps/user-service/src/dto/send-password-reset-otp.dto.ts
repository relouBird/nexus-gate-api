import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendPasswordResetOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class LoginDto {

    @IsEmail({
            blacklisted_chars: "!?()[]*^#$&",
        },
        {
            message: "l'adresse email n'est pas valide",
        }
    )
    @IsString({
        message: "l email doit etre une chaine de caracteres'"
    })
    @IsNotEmpty({
        message: "l email est un champ obligatoir",
    })
    @ApiProperty({
        description: "l'adresse email de l'user",
        example: "user@gmail.com",
        required: true,
    })
    email!: string;


    @IsString({
        message: "le mot de passe doit etre une chaine de caracteres'"
    })
    @IsNotEmpty({
        message: "le mot de passe est un champ obligatoir",
    })
    @MinLength(8, {
        message: "le mot de passe doit contenir au moins 8 caracteres",
    })
    @ApiProperty({
        description: "le mot de passe de l'user",
        example: "password123",
        required: true,
    })
    password!: string;
}
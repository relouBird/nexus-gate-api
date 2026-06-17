import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {

    @IsString({
        message: "le nom doit etre une chaine de caracteres'"
    })
    @IsNotEmpty({
        message: "le nom est un champ obligatoire",
    })
    @ApiProperty({
        description: "le nom de l'user",
        example: "John Doe",
        required: true,
    })
    firstName!: string;


    @IsString({
        message: "le prenom doit etre une chaine de caracteres'"
    })
    @IsNotEmpty({
        message: "le prenom est un champ obligatoire",
    })
    @ApiProperty({
        description: "le prenom de l'user",
        example: "John",
        required: true,
    })
    lastName!: string;


    @IsEmail({}, {
        message: "l'adresse email n'est pas valide",
    })
    @IsNotEmpty({
        message: "l'email est un champ obligatoire",
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
        message: "le mot de passe est un champ obligatoire",
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
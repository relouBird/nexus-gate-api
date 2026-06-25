import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum AccessType {
  include = 'include',
  exclude = 'exclude',
}

export class AccessPolicyDto {
  @IsNotEmpty()
  @IsEnum(AccessType)
  mode!: AccessType;

  @IsArray()
  @IsString({ each: true }) // Vérifie que CHAQUE élément est une string
  @IsNotEmpty({ each: true }) // Optionnel: empêche les chaînes vides ["", ""]
  serverIds!: string[]; // Syntaxe TS correcte pour un tableau de strings
}

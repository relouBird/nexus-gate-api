import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';

export class CreateGatewayTokenDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scope?: string[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

export class FindAllGatewayTokensDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

export class RemoveGatewayTokenDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';

// ─── DTO GetLogs ────────────────────────────────────────────────────────────

export class GetLogsDto {
  // Filtres serveurs
  // Si vide ou absent → tous les serveurs accessibles de la team
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    if (Array.isArray(value)) {
      return value;
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  serverIds?: string[];

  // Filtre méthode HTTP (GET, POST, PATCH, DELETE, PUT...)
  @IsOptional()
  @IsString()
  method?: string;

  // Filtre via ("cloud" | "tunnel")
  @IsOptional()
  @IsEnum(['cloud', 'tunnel'])
  via?: 'cloud' | 'tunnel';

  // Filtre status code exact (ex: 200, 404, 500)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(100)
  statusCode?: number;

  // Filtre plage de dates (ISO date string)
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  // Pagination
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

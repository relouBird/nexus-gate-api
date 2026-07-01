import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

import { Transform, Type as ClassType } from 'class-transformer';

export class GetLogsDto {
  // Filtres serveurs
  @IsOptional()
  @ClassType(() => Array)
  @IsArray()
  @IsString({ each: true })
  serverIds?: string[];

  // Filtre méthode HTTP
  @IsOptional()
  @IsString()
  method?: string;

  // Filtre via ("cloud" | "tunnel")
  @IsOptional()
  @IsEnum(['cloud', 'tunnel'])
  via?: 'cloud' | 'tunnel';

  // Filtre status code exact
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsInt()
  @Min(100)
  statusCode?: number;

  // Filtre plage de dates
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
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { AuthContextDto } from '../common/interfaces/auth-context.dto';

export enum ServerType {
  CLOUD = 'CLOUD',
  LOCAL = 'LOCAL',
}

// ───────────────────────────────────────────────────────────────
// ─── CREATE SERVER ─────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class CreateServerDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(ServerType)
  type?: ServerType;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── FIND ALL SERVER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class FindAllServersDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── FIND ONE SERVER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class FindOneServerDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── UPDATE SERVER ─────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class UpdateServerDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(ServerType)
  type?: ServerType;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── ADD AUTH SERVER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class TokenAuthServerDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsBoolean()
  requireToken!: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── ADD HEADER SERVER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class HeaderServerDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsObject()
  headers!: Record<string, string>;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── REVOKE SERVER ─────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class RevokeServerDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── GRANT SERVER ──────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class GrantServerDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsArray()
  @IsString({ each: true })
  userIds!: string[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

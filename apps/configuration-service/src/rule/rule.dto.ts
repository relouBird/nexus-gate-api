import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';
import { ActionType, RuleType } from '../generated/prisma-client/client';

// ───────────────────────────────────────────────────────────────
// ─── CREATE RULE ───────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class CreateRuleDto {
  @IsNotEmpty()
  @IsUUID()
  serverId!: string;

  @IsNotEmpty()
  @IsEnum(RuleType)
  type!: RuleType;

  @IsNotEmpty()
  @IsObject()
  condition!: Record<string, any>;

  @IsNotEmpty()
  @IsEnum(ActionType)
  action!: ActionType;

  @IsOptional()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── FIND ALL SERVER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class FindAllRulesDto {
  @IsNotEmpty()
  @IsUUID()
  serverId!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── UPDATE SERVER ─────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class UpdateRuleDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsEnum(RuleType)
  type?: RuleType;

  @IsOptional()
  @IsObject()
  condition?: Record<string, any>;

  @IsOptional()
  @IsEnum(ActionType)
  action?: ActionType;

  @IsOptional()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

// ───────────────────────────────────────────────────────────────
// ─── FIND ONE SERVER ───────────────────────────────────────────
// ───────────────────────────────────────────────────────────────

export class FindOneRuleDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

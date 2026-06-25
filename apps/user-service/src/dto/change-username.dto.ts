import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AuthContextDto } from '../common/interfaces/auth-context.dto';

export class ChangeUsernameDto {
  @IsString()
  username!: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AuthContextDto)
  requester!: AuthContextDto;
}

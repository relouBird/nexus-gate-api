import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { OtpModule } from '../otp/otp.module';
import { DatabaseModule } from '@nexus/database';

@Module({
  imports: [DatabaseModule, OtpModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}

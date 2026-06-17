import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TeamService } from './team.service';
import type { RequestAuth } from '../types/auth.type';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  /**
   * =========================
   * 🔐 ROUTE ALL TEAMS
   * =========================
   * GET /teams/all
   * Route pour avoir les informations sur les équipes.
   */
  @HttpCode(HttpStatus.OK)
  @Get('all')
  @ApiOperation({ summary: 'Liste de toutes les équipes' })
  GetAllWallets(@Request() req: RequestAuth) {
    const user = req['user'];
    return this.teamService.getAllTeams();
  }
}

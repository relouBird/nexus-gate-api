import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TeamService } from './team.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { DeleteTeamDto } from './dto/delete-team.dto';
import { TEAM_PATTERNS } from './team.constants';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller()
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  /**
   * POST /team/register
   * Crée une Team + un compte CREATOR.
   */
  @MessagePattern(TEAM_PATTERNS.TEAM_REGISTER)
  registerMessage(@Payload() dto: RegisterTeamDto) {
    return this.teamService.registerTeam(dto);
  }

  /**
   * POST /team/update
   * Mets à jour la team
   */
  @MessagePattern(TEAM_PATTERNS.TEAM_UPDATE)
  updateMessage(@Payload() dto: UpdateTeamDto) {
    return this.teamService.deleteTeam(dto);
  }

  /**
   * DELETE /auth/team
   * Supprime la Team du requester (+ cascade). Réservé au CREATOR.
   */
  @MessagePattern(TEAM_PATTERNS.TEAM_DELETE)
  deleteMessage(@Payload() dto: DeleteTeamDto) {
    return this.teamService.deleteTeam(dto);
  }
}

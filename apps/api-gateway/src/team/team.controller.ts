import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { AuthRequest } from '../common/interfaces/auth-context.interface';
import { TeamService } from './team.service';
import { Public } from '../auth/auth.public';

// Déclaration du contrôleur avec le préfixe global "team"
// Toutes les routes commenceront par /team
@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  private validateRequestBody(body: any) {
    if (body === null || body === undefined) {
      throw new BadRequestException('Request body is required');
    }
  }

  /**
   * =========================
   * 🔐 ROUTE REGISTER
   * =========================
   * GET /team/register
   * Route publique (pas besoin de token)
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  registerTeam(@Body() registerDto: any) {
    this.validateRequestBody(registerDto);
    return this.teamService.registerTeam(registerDto);
  }

  /**
   * =========================
   * 🔰 ROUTE UPDATE
   * =========================
   * POST /team/update
   * Permet de mettre à jour le compte equipe
   * (ex: suppression refresh token, blacklist, etc.)
   */
  @HttpCode(HttpStatus.OK)
  @Post('update')
  update(@Request() req: AuthRequest, @Body() body: any) {
    return this.teamService.updateTeam(body, req.user);
  }

  /**
   * =========================
   * 🚪 ROUTE DELETE
   * =========================
   * POST /team/delete
   * Permet de supprimer le compte equipe
   * (ex: suppression refresh token, blacklist, etc.)
   */
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  delete(@Request() req: AuthRequest) {
    return this.teamService.deleteTeam(req.user);
  }
}

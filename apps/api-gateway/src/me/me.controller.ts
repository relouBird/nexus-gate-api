import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { AuthRequest } from '../common/interfaces/auth-context.interface';
import { MeService } from './me.service';

// Déclaration du contrôleur avec le préfixe global "team"
// Toutes les routes commenceront par /team
@Controller('me')
export class MeController {
  constructor(private meService: MeService) {}

  private validateRequestBody(body: any) {
    if (body === null || body === undefined) {
      throw new BadRequestException('Request body is required');
    }
  }

  /**
   * =========================
   * 🔐 ROUTE GET ME
   * =========================
   * GET /me/
   * Route privé permet de recuperer les informations utilisateurs
   */
  @HttpCode(HttpStatus.OK)
  @Get()
  getMe(@Request() req: AuthRequest) {
    return this.meService.getMe(req.user);
  }

  /**
   * =========================
   * 🚪 ROUTE CHANGE PASSWORD
   * =========================
   * POST /me/change-password
   * Permet de changer de mot de passe
   */
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassord(@Request() req: AuthRequest, @Body() changePDto: any) {
    this.validateRequestBody(changePDto);
    return this.meService.changePassword(changePDto, req.user);
  }

  /**
   * =========================
   * 🚪 ROUTE CHANGE USERNAME
   * =========================
   * POST /me/change-username
   * Permet de changer de nom d'utilisateur
   */
  @HttpCode(HttpStatus.OK)
  @Post('change-username')
  changeUsername(@Request() req: AuthRequest, @Body() changeUDto: any) {
    this.validateRequestBody(changeUDto);
    return this.meService.changeUsername(changeUDto, req.user);
  }

  /**
   * =========================
   * 🚪 ROUTE DELETE ACCOUNT
   * =========================
   * POST /me/delete-account
   * Permet de supprimer son compte
   */
  @HttpCode(HttpStatus.OK)
  @Delete('delete-account')
  delete(@Request() req: AuthRequest) {
    return this.meService.deleteAccount(req.user);
  }
}

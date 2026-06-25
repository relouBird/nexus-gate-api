import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import type { AuthRequest } from '../common/interfaces/auth-context.interface';
import { UserService } from './user.service';

// Déclaration du contrôleur avec le préfixe global "users"
// Toutes les routes commenceront par /users
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  private validateRequestBody(body: any) {
    if (body === null || body === undefined) {
      throw new BadRequestException('Request body is required');
    }
  }

  /**
   * =========================
   * 🔐 ROUTE POST USERS
   * =========================
   * POST /USERS/
   * Route privé permet de créer des utilisateurs
   */
  @HttpCode(HttpStatus.CREATED)
  @Post()
  createUser(@Request() req: AuthRequest, @Body() data: any) {
    return this.userService.createUser(data, req.user);
  }

  /**
   * =========================
   * 🔐 ROUTE GET USERS
   * =========================
   * GET /USERS/
   * Route privé permet de recuperer tous les utilisateurs
   */
  @HttpCode(HttpStatus.OK)
  @Get()
  getUsers(@Request() req: AuthRequest) {
    return this.userService.getManyUser(req.user);
  }

  /**
   * =========================
   * 🔐 ROUTE GET USERS
   * =========================
   * GET /USERS/:ID
   * Route privé permet de recuperer un seul Utilisateur par son id unique
   */
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  getUserById(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.userService.getUser(id, req.user);
  }

  /**
   * =========================
   * 🚪 ROUTE UPDATE USER
   * =========================
   * PATCH /USERS/:ID
   * Permet de mettre à jour les données d'un utilisateur
   */
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  updateUser(
    @Request() req: AuthRequest,
    @Body() updateDto: any,
    @Param('id') id: string,
  ) {
    this.validateRequestBody(updateDto);
    return this.userService.updateUser(id, updateDto, req.user);
  }

  /**
   * =========================
   * 🚪 ROUTE DELETE USER
   * =========================
   * DELETE /USERS/:ID
   * Permet de supprimer son compte
   */
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  delete(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.userService.deleteUser(id, req.user);
  }
}

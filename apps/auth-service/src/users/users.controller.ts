import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';

// Déclaration du contrôleur avec le préfixe global "auth"
// Toutes les routes commenceront par /auth
@Controller('users')
export class AuthController {
  constructor(private usersService: UsersService) {}

  /**
   * =========================
   * 🔐 ROUTE USERS
   * =========================
   * POST /users/all
   */
  @HttpCode(HttpStatus.OK)
  @Get('all')
  getAll() {
    return this.usersService.users({});
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import type { AuthRequest } from '../common/interfaces/auth-context.interface';
import { Public } from './auth.public';

// Déclaration du contrôleur avec le préfixe global "auth"
// Toutes les routes commenceront par /auth
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private validateRequestBody(body: any) {
    if (body === null || body === undefined) {
      throw new BadRequestException('Request body is required');
    }
  }

  /**
   * =========================
   * 🔐 ROUTE PRINCIPAL
   * =========================
   * GET /auth/
   * Route publique (pas besoin de token)
   */
  @HttpCode(HttpStatus.OK)
  @Get('check')
  getStatement() {
    return this.authService.getHello();
  }

  /**
   * =========================
   * 🔐 ROUTE LOGIN
   * =========================
   * POST /auth/login
   * Route publique (pas besoin de token)
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: any) {
    this.validateRequestBody(signInDto);
    return this.authService.signIn(signInDto);
  }

  /**
   * =========================
   * 🚪 ROUTE LOGOUT
   * =========================
   * POST /auth/logout
   * Permet de déconnecter l'utilisateur
   * (ex: suppression refresh token, blacklist, etc.)
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Request() req: AuthRequest) {
    return this.authService.logout({}, req.user);
  }

  /**
   * =========================
   *  🔢 ROUTE SEND OTP
   * =========================
   * POST /auth/send-otp
   * Envoi d'un code OTP à l'utilisateur
   */
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('send-otp')
  postSendOtp(@Body() sendOtpDto: any) {
    this.validateRequestBody(sendOtpDto);
    return this.authService.sendOtp(sendOtpDto);
  }

  /**
   * =========================
   *  🔢 ROUTE VERIFY OTP
   * =========================
   * POST /auth/verify-otp
   * Permet de vérifier le code OTP envoyé à l'utilisateur
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-otp')
  postVerifyOtp(@Body() verifyOtpDto: any) {
    this.validateRequestBody(verifyOtpDto);
    return this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * =========================
   * 🔐 ROUTE RESET PASSWORD
   * =========================
   * POST /auth/reset-password
   * Permet de réinitialiser le mot de passe de l'utilisateur
   * (Dans notre concept, recreer un nouveau mot de passe)
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(
    @Body()
    resetPasswordDto: any,
  ) {
    this.validateRequestBody(resetPasswordDto);
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * =========================
   * 🔐 ROUTE CHANGE PASSWORD
   * =========================
   * POST /auth/change-password
   * Permet de changer le mot de passe de l'utilisateur connecté
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  changePassword(
    @Body()
    changePasswordDto: any,
  ) {
    this.validateRequestBody(changePasswordDto);
    const data = this.authService.changePassword(changePasswordDto);
    return data;
  }
}

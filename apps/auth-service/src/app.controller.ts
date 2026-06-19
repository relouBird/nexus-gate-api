import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { LoginDto } from './dto/login.dto';
import { AUTH_PATTERNS } from './app.constants';
import { ChangePasswordWithOtpDto } from './dto/change-password-with-otp.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { SendPasswordResetOtpDto } from './dto/send-password-reset-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LogoutDto } from './dto/logout.dto';

@Controller()
export class AppController {
  constructor(private readonly authServiceService: AppService) {}

  /**
   * Connexion d'un utilisateur.
   */
  @MessagePattern(AUTH_PATTERNS.LOGIN)
  loginMessage(@Payload() loginDto: LoginDto) {
    return this.authServiceService.login(loginDto);
  }

  /**
   * Déconnexion d'un utilisateur.
   */
  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  logoutMessage(@Payload() logoutDto: LogoutDto) {
    return this.authServiceService.logout(logoutDto);
  }

  /** POST /auth/otp/send — Envoie un OTP. Public. */
  @MessagePattern(AUTH_PATTERNS.SEND)
  sendMessage(@Payload() dto: SendOtpDto) {
    return this.authServiceService.sendOtp(dto);
  }

  /** POST /auth/otp/verify — Vérifie l'OTP (ne le consomme pas). Public. */
  @MessagePattern(AUTH_PATTERNS.VERIFY)
  verifyMessage(@Payload() dto: VerifyOtpDto) {
    return this.authServiceService.verifyOtp(dto);
  }

  /** POST /auth/otp/reset-password — Démarre le flow, envoie un OTP. Public. */
  @MessagePattern(AUTH_PATTERNS.SEND_PASSWORD_RESET)
  sendPasswordResetMessage(@Payload() dto: SendPasswordResetOtpDto) {
    return this.authServiceService.sendPasswordResetOtp(dto);
  }

  /** POST /auth/otp/change-password — Vérifie l'OTP puis change le password. Public. */
  @MessagePattern(AUTH_PATTERNS.CHANGE_PASSWORD)
  changePasswordMessage(@Payload() dto: ChangePasswordWithOtpDto) {
    return this.authServiceService.changePasswordWithOtp(dto);
  }

  /**
   * Vérification de l'état du microservice.
   */
  @MessagePattern(AUTH_PATTERNS.HELLO)
  getHelloMessage() {
    return this.authServiceService.getHello();
  }
}

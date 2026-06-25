import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ME_PATTERNS } from './app.constants';
import { GetMeDto } from './dto/get-me.dto';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller()
export class AppController {
  constructor(private readonly userService: AppService) {}

  /**
   * Récupere les informations d'un utilisateur
   */
  @MessagePattern(ME_PATTERNS.ME_GET)
  getMeMessage(@Payload() meDto: GetMeDto) {
    return this.userService.getMe(meDto);
  }

  /**
   * Mets à jour le nom d'utilisateur
   */
  @MessagePattern(ME_PATTERNS.ME_CHANGE_USERNAME)
  updateUsernameMessage(@Payload() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto);
  }

  /**
   * Mets à jour le mot de passe
   */
  @MessagePattern(ME_PATTERNS.ME_CHANGE_PASSWORD)
  updatePasswordMessage(@Payload() passwordDto: ChangePasswordDto) {
    return this.userService.changePassword(passwordDto);
  }

  /**
   * Vérification de l'état du microservice.
   */
  @MessagePattern(ME_PATTERNS.ME_HELLO)
  getHelloMessage() {
    return this.userService.getHello();
  }
}

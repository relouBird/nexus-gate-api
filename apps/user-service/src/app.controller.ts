import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ME_PATTERNS } from './app.constants';

@Controller()
export class AppController {
  constructor(private readonly userService: AppService) {}

  /**
   * Connexion d'un utilisateur.
   */
  @MessagePattern(ME_PATTERNS.ME_GET)
  loginMessage(@Payload() loginDto: any) {
    return this.userService.login();
  }

  /**
   * Vérification de l'état du microservice.
   */
  @MessagePattern(ME_PATTERNS.ME_HELLO)
  getHelloMessage() {
    return this.userService.getHello();
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CONFIGURATION_PATTERNS } from './app.constants';

@Controller()
export class AppController {
  constructor(private readonly userService: AppService) {}

  /**
   * Vérification de l'état du microservice.
   */
  @MessagePattern(CONFIGURATION_PATTERNS.CONFIGURATION_HELLO)
  getHelloMessage() {
    return this.userService.getHello();
  }
}

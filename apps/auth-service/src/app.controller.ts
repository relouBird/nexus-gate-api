import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AUTH_PATTERNS } from './app.constants';

@Controller()
export class AppController {
  constructor(private readonly authServiceService: AppService) {}

  /**
   * Création d'un utilisateur / inscription.
   */
  @MessagePattern(AUTH_PATTERNS.REGISTER)
  registerMessage(@Payload() createUserDto: RegisterDto) {
    return this.authServiceService.register(createUserDto);
  }

  /**
   * Connexion d'un utilisateur.
   */
  @MessagePattern(AUTH_PATTERNS.LOGIN)
  loginMessage(@Payload() loginDto: LoginDto) {
    return this.authServiceService.login(loginDto);
  }

  /**
   * Vérification de l'état du microservice.
   */
  @MessagePattern(AUTH_PATTERNS.HELLO)
  getHelloMessage() {
    return this.authServiceService.getHello();
  }
}

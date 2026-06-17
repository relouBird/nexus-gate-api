import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { RegisterDto, LoginDto } from './dto/auth-service.dto';

@Controller('api')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly apiGatewayService: AppService) {}

  /**
   * Création d'un nouvel utilisateur.
   */
  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouvel utilisateur',
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  async registerUsers(@Body() body: RegisterDto): Promise<any> {
    this.logger.log(
      `[API Gateway] Registration request received: ${body.email}`,
    );

    return this.apiGatewayService.registerUser(body);
  }

  /**
   * Connexion d'un utilisateur.
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect',
  })
  async loginUsers(@Body() body: LoginDto): Promise<any> {
    this.logger.log(`[API Gateway] Login request received: ${body.email}`);

    return this.apiGatewayService.loginUser(body);
  }

  /**
   * Vérification de l'état de l'API Gateway et du microservice d'authentification.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Tester la communication avec le service d'authentification",
  })
  @ApiResponse({
    status: 200,
    description: "Le service d'authentification est disponible",
  })
  async getHello(): Promise<any> {
    this.logger.log('[API Gateway] Health check request received');

    return this.apiGatewayService.getHello();
  }
}

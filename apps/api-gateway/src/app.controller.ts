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

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly apiGatewayService: AppService) {}

  /**
   * Vérification de l'état de l'API Gateway et du microservice d'authentification.
   */
  @Get('/health')
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

    return this.apiGatewayService.getHealth();
  }
}

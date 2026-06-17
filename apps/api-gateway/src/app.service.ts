import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from './app.constant';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.AUTH_SERVICE)
    private readonly authServiceClient: ClientProxy,
  ) {}

  /**
   * Inscription d'un utilisateur.
   */
  async registerUser(body: any): Promise<any> {
    this.logger.log(
      `[Gateway] Forwarding registration request for: ${body.email}`,
    );

    return this.sendToAuthService('register_user', body);
  }

  /**
   * Connexion d'un utilisateur.
   */
  async loginUser(body: any): Promise<any> {
    this.logger.log(`[Gateway] Forwarding login request for: ${body.email}`);

    return this.sendToAuthService('login_user', body);
  }

  /**
   * Vérification de l'état du service d'authentification.
   */
  async getHello(): Promise<any> {
    this.logger.log('[Gateway] Forwarding hello request to auth service');

    return this.sendToAuthService('hello_get', {});
  }

  /**
   * Envoi générique d'une requête au microservice d'authentification.
   */
  private async sendToAuthService(pattern: string, payload: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.authServiceClient.send(pattern, payload),
      );
    } catch (error: any) {
      this.logger.error(
        `[Gateway] RPC call "${pattern}" failed: ${error.message}`,
        error.stack,
      );

      this.handleServiceError(error);
    }
  }

  /**
   * Conversion des erreurs RPC en erreurs HTTP.
   */
  private handleServiceError(error: any): never {
    // Service inaccessible
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ECONNRESET') {
      this.logger.error('Auth service is unreachable');

      throw new ServiceUnavailableException(
        "Le service d'authentification est indisponible",
      );
    }

    // Erreur RPC renvoyée par le microservice
    const rpcError = error?.error ?? error;

    switch (rpcError?.statusCode) {
      case 400:
        throw new BadRequestException(rpcError.message);

      case 401:
        throw new UnauthorizedException(rpcError.message);

      case 404:
        throw new NotFoundException(rpcError.message);

      case 409:
        throw new ConflictException(rpcError.message);

      default:
        this.logger.error(`Unexpected RPC error: ${JSON.stringify(rpcError)}`);

        throw new InternalServerErrorException(
          rpcError?.message || 'Une erreur interne est survenue',
        );
    }
  }
}

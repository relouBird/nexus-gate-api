import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor() {}

  /**
   * Vérification de l'état du service d'authentification.
   */
  async getHealth(): Promise<any> {
    this.logger.log('[Gateway] Forwarding hello request to auth service');

    return '/ GET Health ENDPOINT';
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS, MICROSERVICES_CLIENTS } from '../app.constant';
import { DispatchInteface, sendToAuthService } from '../app.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.AUTH_SERVICE)
    private readonly authServiceClient: ClientProxy,
  ) {}

  /**
   * Connexion d'un utilisateur.
   */
  async signIn(payload: any): Promise<any> {
    this.logger.log(
      `[Gateway] Forwarding login request for: ${payload?.email}`,
    );

    return this.dispatch({ pattern: AUTH_PATTERNS.LOGIN, payload });
  }

  /**
   * Déconnexion d'un utilisateur.
   */
  async logout(payload: any, requester?: any): Promise<any> {
    this.logger.log(`[Gateway] Forwarding Logout request for: ${payload}`);

    return this.dispatch({ pattern: AUTH_PATTERNS.LOGOUT, payload, requester });
  }

  async sendOtp(email: string) {
    return this.dispatch({
      pattern: AUTH_PATTERNS.SEND_OTP,
      payload: { email },
    });
  }

  async verifyOtp(payload: any) {
    return this.dispatch({ pattern: AUTH_PATTERNS.VERIFY_OTP, payload });
  }

  async changePassword(payload: any) {
    return this.dispatch({ pattern: AUTH_PATTERNS.CHANGE_PASSWORD, payload });
  }

  async resetPassword(payload: any) {
    return this.dispatch({ pattern: AUTH_PATTERNS.RESET_PASSWORD, payload });
  }

  /**
   * Vérification de l'état du service d'authentification.
   */
  async getHello(): Promise<any> {
    this.logger.log('[Gateway] Forwarding hello request to auth service');

    return this.dispatch({ pattern: AUTH_PATTERNS.HELLO });
  }

  // Ceci est ce qui doit etre mit dans tous les services
  private async dispatch(interfacePayload: DispatchInteface) {
    let payload = {};
    let pattern = interfacePayload.pattern;

    if (interfacePayload.payload) {
      payload = { ...payload };
    }

    if (interfacePayload.requester) {
      payload = { ...payload, requester: interfacePayload.requester };
    }

    return sendToAuthService(
      this.authServiceClient,
      pattern,
      payload,
      this.logger,
    );
  }
}

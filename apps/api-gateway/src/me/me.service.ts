// redis.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MICROSERVICES_CLIENTS, USER_PATTERNS } from '../app.constant';
import { ClientProxy } from '@nestjs/microservices';
import { DispatchInteface, sendToAuthService } from '../app.helper';

@Injectable()
export class MeService {
  private readonly logger = new Logger(MeService.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.USER_SERVICE)
    private readonly authServiceClient: ClientProxy,
  ) {}

  async getMe(requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.ME_GET,
      requester,
    });
  }

  async changePassword(dto: any, requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.ME_CHANGE_PASSWORD,
      payload: dto,
      requester,
    });
  }

  async changeUsername(dto: any, requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.ME_CHANGE_USERNAME,
      payload: dto,
      requester,
    });
  }

  async deleteAccount(requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.ME_DELETE_ACCOUNT,
      requester,
    });
  }

  // Ceci est ce qui doit etre mit dans tous les services
  private async dispatch(interfacePayload: DispatchInteface) {
    let payload = {};
    let pattern = interfacePayload.pattern;

    if (interfacePayload.payload) {
      payload = { ...payload, ...interfacePayload.payload };
    }

    if (interfacePayload.requester) {
      const { iat, exp, ...requester } = interfacePayload.requester;
      payload = { ...payload, requester };
    }

    return sendToAuthService(
      this.authServiceClient,
      pattern,
      payload,
      this.logger,
    );
  }
}

// redis.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MICROSERVICES_CLIENTS, USER_PATTERNS } from '../app.constant';
import { ClientProxy } from '@nestjs/microservices';
import { DispatchInteface, sendToAuthService } from '../app.helper';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.USER_SERVICE)
    private readonly authServiceClient: ClientProxy,
  ) {}

  async createUser(body: any, requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.USERS_CREATE,
      payload: body,
      requester,
    });
  }

  async getUser(id: string, requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.USERS_FIND_ONE,
      payload: { id },
      requester,
    });
  }

  async getManyUser(requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.USERS_FIND_ALL,
      requester,
    });
  }

  async updateUser(id: string, body: any, requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.USERS_UPDATE,
      payload: { id, ...body },
      requester,
    });
  }

  async deleteUser(id: string, requester: any) {
    return this.dispatch({
      pattern: USER_PATTERNS.USERS_DELETE,
      payload: { id },
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

// redis.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AUTH_PATTERNS, MICROSERVICES_CLIENTS } from '../app.constant';
import { ClientProxy } from '@nestjs/microservices';
import { DispatchInteface, sendToAuthService } from '../app.helper';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.AUTH_SERVICE)
    private readonly authServiceClient: ClientProxy,
  ) {}

  async registerTeam(dto: any) {
    return this.dispatch({
      pattern: AUTH_PATTERNS.TEAM_REGISTER,
      payload: dto,
    });
  }

  async updateTeam(body: any, requester: any) {
    return this.dispatch({
      pattern: AUTH_PATTERNS.TEAM_UPDATE,
      payload: body,
      requester,
    });
  }

  async deleteTeam(requester: any) {
    return this.dispatch({
      pattern: AUTH_PATTERNS.TEAM_DELETE,
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
